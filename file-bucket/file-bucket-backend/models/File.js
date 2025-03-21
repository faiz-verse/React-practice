const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema({
    bucketUrl: { type: String, required: true }, // Reference to the bucket
    fileName: { type: String, required: true }, // Name of the file
    fileType: { type: String, required: true }, // File Type
    fileSize: { type: String, required: true },
    filePath: { type: String, required: true }, // Storage location
    uploadedAt: { type: Date, default: Date.now }, // Upload timestamp
    provider: { type: String, required: true } // stored inside which cloud storage
});

const File = mongoose.model("File", fileSchema);
module.exports = File;
