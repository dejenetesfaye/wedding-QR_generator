require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();

// Global request logger
app.use((req, res, next) => {
  console.log(`${new Date().toLocaleTimeString()} - ${req.method} ${req.url}`);
  next();
});

// Allow CORS from our Vercel frontend
app.use(cors({
  origin: process.env.FRONTEND_URL || "*",
  credentials: true
}));
app.use(express.json());


// API Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/events", require("./routes/events"));
app.use("/api/invite", require("./routes/invite"));

// Serve qrcodes.pdf for download
app.get("/api/download/qrcodes.pdf", (req, res) => {
  const filePath = path.join(__dirname, "qrcodes.pdf");
  res.download(filePath, "qrcodes.pdf", (err) => {
    if (err) res.status(404).json({ message: "PDF not found. Generate first." });
  });
});


// API 404 Handler
app.use("/api", (req, res) => {
  console.log(`⚠️ Unmatched API call: ${req.method} ${req.url}`);
  res.status(404).json({ message: `API route not found: ${req.method} ${req.url}` });
});

// Health check for Render
app.get("/health", (req, res) => res.status(200).send("OK"));
app.get("/api/deployment-test", (req, res) => res.json({ version: "v5-last9-fix" }));


// Render/Vercel handles the static files separately, so we just focus on the API.
app.get("/", (req, res) => res.send("Wedding API is running... 🚀💍"));


// Robust MongoDB connection for production
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI, {
  serverSelectionTimeoutMS: 5000
})
  .then(() => {
    console.log("✅ MongoDB connected");
    const PORT = process.env.PORT || 5000;

    // IMPORTANT for cPanel/Passenger: 
    // Listen on PORT but do NOT hardcode "0.0.0.0" or "localhost"
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error("❌ MongoDB Connection Error:", err.message);
    // On cPanel, we want the process to exit so the Node Selector can try restarting it
    process.exit(1);
  });