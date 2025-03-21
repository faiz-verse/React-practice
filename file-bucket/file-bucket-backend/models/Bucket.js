const mongoose = require("mongoose");

const bucketSchema = new mongoose.Schema({
    url: { type: String, required: true, unique: true }, // Unique identifier for the bucket
    createdAt: { type: Date, default: Date.now }, // Time when the bucket was created
    expiresAt: { type: Date, required: true }, // Auto-delete time (7 days from creation)
    emptyTerminationAt: { type: Date, default: () => new Date(Date.now() + 60 * 60 * 1000) }, // 1 hour from creation
    status: { type: String, enum: ["active", "expired", "destroyed"], default: "active" } // Bucket status
});

// Auto-delete buckets if they remain empty for 1 hour
bucketSchema.index({ emptyTerminationAt: 1 }, { expireAfterSeconds: 0 });

const Bucket = mongoose.model("Bucket", bucketSchema);
module.exports = Bucket;
