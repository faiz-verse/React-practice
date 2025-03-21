const express = require("express");
const Bucket = require("../models/Bucket"); // Import Bucket model
const File = require("../models/File"); // Import File model

// for file deletion
const { cloudinary } = require("../cloudinaryConfig"); 
const { drive } = require("../googleDriveConfig");

const router = express.Router();

// Create a new bucket if it does not exist
router.post("/create", async (req, res) => {
    try {
        const { url } = req.body;
        if (!url || url.length <= 3) {
            return res.status(400).json({ success: false, message: "Invalid bucket URL" });
        }

        // Check if the bucket already exists
        let bucket = await Bucket.findOne({ url });

        if (!bucket) {
            // Create a new bucket if it doesn't exist, set 1-hour termination countdown
            bucket = new Bucket({
                url,
                createdAt: new Date(),
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7-day expiry
                emptyTerminationAt: new Date(Date.now() + 60 * 60 * 1000), // 1-hour empty expiry
                status: "active"
            });
            await bucket.save();
            console.log(`New bucket created: ${url}`);
        }

        res.json({ success: true, url, exists: !!bucket });
    } catch (error) {
        console.error("Error creating bucket:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// Function to get resource type based on file extension
const getResourceType = (filePath) => {
    const ext = filePath.split('.').pop().toLowerCase();

    if (["jpg", "jpeg", "png", "gif", "bmp", "svg", "webp", "ico"].includes(ext)) {
        return "image";
    } else if (["mp4", "avi", "mov", "mkv", "flv", "wmv", "webm", "mp3", "wav", "ogg", "m4a"].includes(ext)) {
        return "video";
    } else {
        return "raw"; 
    }
};

// ✅ Function to delete all files from Cloudinary & Google Drive
const deleteFilesFromCloud = async (files) => {
    const rawFiles = [];
    const otherFiles = [];

    for (const file of files) {
        try {
            if (file.provider === "Cloudinary") {
                console.log(`☁ Deleting from Cloudinary: ${file.filePath}`);

                const resourceType = getResourceType(file.filePath); 
                let publicId = file.filePath.split("/filebucket/")[1];

                if (resourceType !== "raw") {
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
};

// mark expire
router.get("/:url", async (req, res) => {
    try {
        const bucket = await Bucket.findOne({ url: req.params.url });

        if (!bucket) {
            return res.status(404).json({ success: false, status: "not_found", message: "Bucket does not exist!" });
        }

        const now = new Date();

        // ✅ Safe check for emptyTerminationAt
        if (bucket.emptyTerminationAt && now > bucket.emptyTerminationAt) {
            const fileCount = await File.countDocuments({ bucketUrl: req.params.url });

            if (fileCount === 0) { 
                await Bucket.updateOne({ url: req.params.url }, { $set: { status: "expired" } });
                return res.status(410).json({ success: false, status: "expired", message: "Bucket expired due to inactivity (1 hour without files)!" });
            }
        }

        // ✅ Check for 7-day expiration
        if (now > bucket.expiresAt) {
            console.log(`🚨 Bucket expired: ${bucket.url}. Deleting all files...`);

            const files = await File.find({ bucketUrl: bucket.url });

            if (files.length > 0) {
                await deleteFilesFromCloud(files); // ✅ Function to delete files from Cloudinary & Google Drive
                await File.deleteMany({ bucketUrl: bucket.url }); // ✅ Delete file records
                console.log(`✅ Deleted ${files.length} files from expired bucket: ${bucket.url}`);
            }

            await Bucket.updateOne({ url: req.params.url }, { $set: { status: "expired" } });
            return res.status(410).json({ success: false, status: "expired", message: "Bucket has expired!" });
        }

        res.json({ success: true, status: bucket.status, ...bucket.toObject() });
    } catch (error) {
        console.error("Error fetching bucket:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// 🚮 Delete Bucket and Its Files
router.delete("/:url", async (req, res) => {
    try {
        const { url } = req.params;
        const bucket = await Bucket.findOne({ url });

        if (!bucket) {
            return res.status(404).json({ success: false, message: "Bucket does not exist!" });
        }

        if (bucket.status === "destroyed") {
            return res.status(400).json({ success: false, message: "Bucket is already destroyed!" });
        }

        // ✅ Fetch all files in the bucket
        const files = await File.find({ bucketUrl: url });

        if (files.length > 0) {
            await deleteFilesFromCloud(files); // ✅ Delete files from Cloudinary & Google Drive
            await File.deleteMany({ bucketUrl: url }); // ✅ Delete file records from MongoDB
            console.log(`✅ Deleted ${files.length} files from bucket: ${bucket.url}`);
        }

        // ✅ Mark bucket as destroyed
        bucket.status = "destroyed"; 
        await bucket.save();

        res.json({ success: true, message: "Bucket and all files deleted successfully!" });

    } catch (error) {
        console.error("🔥 Error destroying bucket:", error);
        res.status(500).json({ success: false, message: "Server error!" });
    }
});

// Restore a destroyed or expired bucket
router.put("/:url/restore", async (req, res) => {
    try {
        const bucket = await Bucket.findOne({ url: req.params.url });

        if (!bucket) {
            return res.status(404).json({ success: false, message: "Bucket does not exist!" });
        }

        if (bucket.status === "active") {
            return res.status(400).json({ success: false, message: "Bucket is already active!" });
        }

        // ✅ Reset expiration time and status
        bucket.status = "active";  // ✅ Make sure status is updated
        bucket.createdAt = new Date(Date.now()); // Reset created at
        bucket.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // Reset expiry to 7 days
        bucket.emptyTerminationAt = new Date(Date.now() + 60 * 60 * 1000); // Reset empty deletion to 1 hour
        await bucket.save();

        res.json({ success: true, message: "Bucket restored successfully!" }); // ✅ Change response message
    } catch (error) {
        console.error("Error restoring bucket:", error);
        res.status(500).json({ success: false, message: "Server error!" });
    }
});

module.exports = router;