require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: "*" })); // Allow all origins
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => console.error("❌ MongoDB Connection Error:", err));

// Test Route
app.get("/", (req, res) => {
    res.send("<h1>FileBucket Backend is Running! 🚀</h1>");
});

// Routes
const bucketRoutes = require("./routes/bucketRoutes");
app.use("/api/buckets", bucketRoutes);

const fileRoutes = require("./routes/fileRoutes"); 
app.use("/api/files", fileRoutes);


// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
