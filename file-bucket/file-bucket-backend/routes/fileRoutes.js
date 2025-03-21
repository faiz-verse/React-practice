const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const { cloudinary } = require("../cloudinaryConfig");
const { drive } = require("../googleDriveConfig");
const File = require("../models/File");
const Bucket = require("../models/Bucket");

const router = express.Router();

// 🔥 Multer Storage Setup for Local Uploads (Google Drive Only)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, "../uploads");
        if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = multer({ storage });

// 🔥 Upload Route
router.post("/upload", upload.array("files"), async (req, res) => {
    try {
        console.log("✅ Upload Request Received:", req.body);

        const bucketUrl = req.body.bucketUrl;
        if (!bucketUrl) {
            return res.status(400).json({ success: false, message: "Bucket URL is required" });
        }

        if (!req.files || req.files.length === 0) {
            console.log("❌ No files received!");
            return res.status(400).json({ success: false, message: "No files uploaded" });
        }

        console.log("📂 Files received:", req.files.map(f => f.originalname));

        const uploadedFiles = [];

        for (const file of req.files) {
            try {
                let filePath, provider;
                console.log(`🔄 Processing file: ${file.originalname} (${file.size} bytes)`);

                if (file.size <= 10 * 1024 * 1024) {
                    // ✅ Upload to Cloudinary (No Local Storage Needed)
                    console.log("☁ Uploading to Cloudinary...");
                    const cloudinaryResponse = await cloudinary.uploader.upload(file.path, {
                        folder: "filebucket",
                        resource_type: "auto",
                        use_filename: true,
                        unique_filename: false,
                    });

                    filePath = cloudinaryResponse.secure_url;
                    provider = "Cloudinary";
                    console.log("✅ Cloudinary Upload Successful:", filePath);

                    // ❌ Remove local file (Not needed for Cloudinary)
                    fs.unlinkSync(file.path);
                } else {
                    // ✅ Upload to Google Drive (Requires Local Storage)
                    console.log("🚀 Uploading to Google Drive...");
                    const timestampedFileName = `${Date.now()}-${file.originalname}`;

                    const fileMetadata = {
                        name: timestampedFileName,  // ✅ Ensure unique filename with timestamp
                        parents: ["1CEx18ficGqMZM8jvmA07EAviy9UlDuxX"] // Replace with actual Google Drive folder ID
                    };

                    const media = {
                        mimeType: file.mimetype,
                        body: fs.createReadStream(file.path)
                    };

                    const driveFile = await drive.files.create({
                        resource: fileMetadata,
                        media: media,
                        fields: "id, webViewLink, webContentLink",
                    });

                    await drive.permissions.create({
                        fileId: driveFile.data.id,
                        requestBody: { role: "reader", type: "anyone" },
                    });

                    filePath = `https://drive.google.com/uc?export=download&id=${driveFile.data.id}`;
                    provider = "Google Drive";
                    console.log("✅ Google Drive Upload Successful:", filePath);

                    // ✅ Delete the local file after successful upload
                    fs.unlinkSync(file.path);
                    console.log("🗑 Local file deleted:", file.path);
                }

                uploadedFiles.push({
                    bucketUrl,
                    fileName: file.originalname,
                    fileType: file.mimetype,
                    fileSize: file.size,
                    filePath,
                    provider
                });
            } catch (uploadErr) {
                console.error("🔥 Error uploading file:", uploadErr);
            }
        }

        // ✅ Ensure bucket exists before saving file records
        const bucket = await Bucket.findOne({ url: bucketUrl });
        if (!bucket) {
            console.log("❌ Bucket not found:", bucketUrl);
            return res.status(404).json({ success: false, message: "Bucket not found" });
        }

        // ✅ Save uploaded files to MongoDB
        if (uploadedFiles.length > 0) {
            await File.insertMany(uploadedFiles);
            await Bucket.updateOne({ url: bucketUrl }, { $unset: { emptyTerminationAt: 1 } });
            console.log("✅ Files saved to database:", uploadedFiles.length);
        }

        res.json({ success: true, message: "Files uploaded successfully!", files: uploadedFiles });
    } catch (error) {
        console.error("🔥 Upload Error in Backend:", error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
});


// ✅ Route to get all files in a bucket
router.get("/:bucketUrl", async (req, res) => {
    try {
        const files = await File.find({ bucketUrl: req.params.bucketUrl });
        res.json({ success: true, files: files || [] });
    } catch (error) {
        console.error("🔥 Error fetching files:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});


// 🔥 Download all files as zip
const archiver = require("archiver"); // ✅ For creating ZIP files
const axios = require("axios"); // ✅ For downloading files
const stream = require("stream"); // ✅ For streaming downloads

// ✅ Route to download all files as a ZIP
router.get("/download-all/:bucketUrl", async (req, res) => {
    try {
        const { bucketUrl } = req.params;

        // ✅ Fetch all files from MongoDB for the given bucket
        const files = await File.find({ bucketUrl });
        if (files.length === 0) {
            return res.status(404).json({ success: false, message: "No files found in this bucket." });
        }

        // ✅ Set ZIP file name
        const zipFileName = `Bucket - ${bucketUrl}.zip`;

        // ✅ Set response headers
        res.setHeader("Content-Disposition", `attachment; filename=${zipFileName}`);
        res.setHeader("Content-Type", "application/zip");

        // ✅ Create a ZIP archive
        const archive = archiver("zip", { zlib: { level: 9 } });
        archive.pipe(res);

        // ✅ Download & Add Each File to the ZIP
        for (const file of files) {
            try {
                let fileBuffer;

                if (file.provider === "Cloudinary") {
                    console.log(`☁ Downloading from Cloudinary: ${file.filePath}`);
                    const cloudinaryURL = file.filePath.replace("/upload/", "/upload/fl_attachment/");
                    const response = await axios.get(cloudinaryURL, { responseType: "arraybuffer" });
                    fileBuffer = response.data;
                } else if (file.provider === "Google Drive") {
                    console.log(`🚀 Downloading from Google Drive: ${file.filePath}`);
                    const fileIdMatch = file.filePath.match(/(?:\/d\/|id=)([a-zA-Z0-9_-]+)/);
                    const fileId = fileIdMatch ? fileIdMatch[1] : null;

                    if (!fileId) {
                        console.error(`❌ Failed to extract Google Drive ID from URL: ${file.filePath}`);
                        continue; // Skip this file if ID extraction fails
                    }

                    const driveDownloadURL = `https://drive.google.com/uc?export=download&id=${fileId}`;
                    const response = await axios.get(driveDownloadURL, { responseType: "arraybuffer" });
                    fileBuffer = response.data;
                } else {
                    console.error(`❌ Unknown provider for file: ${file.filePath}`);
                    continue; // Skip if provider is unknown
                }

                archive.append(fileBuffer, { name: file.fileName.replace(/^\d{13}-/, "") }); // ✅ Remove timestamp from filename
            } catch (err) {
                console.error(`🔥 Error downloading file (${file.fileName}):`, err.message);
            }
        }

        archive.finalize(); // ✅ Finalize ZIP archive
    } catch (error) {
        console.error("🔥 Error creating ZIP:", error);
        res.status(500).json({ success: false, message: "Failed to create ZIP file." });
    }
});

// 🚮 Delete Files Routes

// Function to get resource type based on file extension
const getResourceType = (filePath) => {
    const ext = filePath.split('.').pop().toLowerCase();

    if (["jpg", "jpeg", "png", "gif", "bmp", "svg", "webp", "ico"].includes(ext)) {
        return "image"; 
    } else if (["mp4", "avi", "mov", "mkv", "flv", "wmv", "webm", "mp3", "wav", "ogg", "m4a"].includes(ext)) {
        return "video"; 
    } else {
        return "raw"; // Everything else
    }
};

// 🚮 Delete a Single File
router.delete("/delete/:fileId", async (req, res) => {
    try {
        const { fileId } = req.params;
        const file = await File.findById(fileId);
        if (!file) return res.status(404).json({ success: false, message: "File not found." });

        if (file.provider === "Cloudinary") {
            console.log(`☁ Deleting from Cloudinary: ${file.filePath}`);

            const resourceType = getResourceType(file.filePath); 
            let publicId = file.filePath.split("/filebucket/")[1];

            if (resourceType !== "raw") {
                // ✅ Remove file extension for `image` & `video`
                publicId = publicId.replace(/\.[^/.]+$/, "");
            }

            console.log(`✅ Extracted Public ID: filebucket/${publicId}`);
            console.log(`✅ Detected Resource Type: ${resourceType}`);

            await cloudinary.api.delete_resources([`filebucket/${publicId}`], {
                resource_type: resourceType,
                type: "upload"
            });

            console.log("✅ Cloudinary file deleted.");
        } else if (file.provider === "Google Drive") {
            console.log(`🚀 Deleting from Google Drive: ${file.filePath}`);

            const fileIdMatch = file.filePath.match(/(?:\/d\/|id=)([a-zA-Z0-9_-]+)/);
            const driveFileId = fileIdMatch ? fileIdMatch[1] : null;

            if (driveFileId) {
                await drive.files.delete({ fileId: driveFileId });
                console.log("✅ Google Drive file deleted.");
            }
        }

        await File.findByIdAndDelete(fileId);
        console.log("✅ File record deleted from database.");
        res.json({ success: true, message: "File deleted successfully." });

    } catch (error) {
        console.error("🔥 Error deleting file:", error);
        res.status(500).json({ success: false, message: "Failed to delete file." });
    }
});

// 🚮 Delete All Files in a Bucket
router.delete("/delete-all/:bucketUrl", async (req, res) => {
    try {
        const { bucketUrl } = req.params;
        const files = await File.find({ bucketUrl });
        if (files.length === 0) return res.status(404).json({ success: false, message: "No files found." });

        const rawFiles = [];
        const otherFiles = [];

        for (const file of files) {
            try {
                if (file.provider === "Cloudinary") {
                    console.log(`☁ Deleting from Cloudinary: ${file.filePath}`);

                    const resourceType = getResourceType(file.filePath); 
                    let publicId = file.filePath.split("/filebucket/")[1];

                    if (resourceType !== "raw") {
                        // ✅ Remove file extension for `image` & `video`
                        publicId = publicId.replace(/\.[^/.]+$/, "");
                    }

                    console.log(`✅ Extracted Public ID: filebucket/${publicId}`);
                    console.log(`✅ Detected Resource Type: ${resourceType}`);

                    if (resourceType === "raw") {
                        rawFiles.push(`filebucket/${publicId}`);
                    } else {
                        otherFiles.push({ publicId, resourceType });
                    }
                } else if (file.provider === "Google Drive") {
                    console.log(`🚀 Deleting from Google Drive: ${file.filePath}`);

                    const fileIdMatch = file.filePath.match(/(?:\/d\/|id=)([a-zA-Z0-9_-]+)/);
                    const driveFileId = fileIdMatch ? fileIdMatch[1] : null;

                    if (driveFileId) {
                        await drive.files.delete({ fileId: driveFileId });
                        console.log("✅ Google Drive file deleted.");
                    }
                }
            } catch (err) {
                console.error(`🔥 Error deleting file (${file.fileName}):`, err.message);
            }
        }

        // ✅ Bulk delete raw files
        if (rawFiles.length > 0) {
            await cloudinary.api.delete_resources(rawFiles, {
                resource_type: "raw",
                type: "upload"
            });
            console.log(`✅ Deleted ${rawFiles.length} raw files from Cloudinary.`);
        }

        // ✅ Delete images/videos individually
        for (const file of otherFiles) {
            await cloudinary.api.delete_resources([`filebucket/${file.publicId}`], {
                resource_type: file.resourceType,
                type: "upload"
            });
            console.log(`✅ Deleted ${file.publicId} (${file.resourceType}) from Cloudinary.`);
        }

        await File.deleteMany({ bucketUrl });
        console.log("✅ All file records deleted from database.");
        res.json({ success: true, message: "All files deleted successfully." });

    } catch (error) {
        console.error("🔥 Error deleting all files:", error);
        res.status(500).json({ success: false, message: "Failed to delete all files." });
    }
});


module.exports = router;