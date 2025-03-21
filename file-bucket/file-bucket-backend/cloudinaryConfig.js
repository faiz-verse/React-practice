const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
require("dotenv").config();

// Configure Cloudinary
cloudinary.config({
    cloudinary_url: process.env.CLOUDINARY_URL, // ✅ Use `CLOUDINARY_URL` directly
});

// ✅ Function to determine Cloudinary `resource_type`
const getResourceType = (file) => {
    const ext = file.originalname.split('.').pop().toLowerCase();

    if (["jpg", "jpeg", "png", "gif", "bmp", "svg", "webp", "ico"].includes(ext)) {
        return "image"; // ✅ Image files
    } else if (["mp4", "avi", "mov", "mkv", "flv", "wmv", "webm", "mp3", "wav", "ogg", "m4a"].includes(ext)) {
        return "video"; // ✅ Video & Audio files
    } else {
        return "raw"; // ✅ Everything else (docs, PDFs, ZIPs, JS, CSS, etc.)
    }
};

// ✅ Fix Cloudinary storage to properly classify file types
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        return {
            folder: "filebucket",
            resource_type: getResourceType(file) // ✅ Assign correct `resource_type`
        };
    }
});

const upload = multer({ storage });

module.exports = { cloudinary, upload };
