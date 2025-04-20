const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const videoRoutes = require("./routes/video"); // Import video routes
const adminRoutes = require("./routes/admin"); // Import admin routes

dotenv.config(); // Load environment variables

const app = express();
connectDB(); // Connect to MongoDB

// Ensure uploads/videos directory exists
const videoUploadPath = path.join(__dirname, "uploads/videos");
if (!fs.existsSync(videoUploadPath)) {
  fs.mkdirSync(videoUploadPath, { recursive: true });
}

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173", // Allow requests only from your frontend
    methods: ["GET", "POST", "PUT", "DELETE"], // Allowed HTTP methods
    credentials: true, // Allow cookies and credentials
    exposedHeaders: ["Admin-Access-Code"], // Allow frontend to read this header
  })
);
app.options("*", cors()); // Handle preflight requests for all routes
app.use(express.json()); // Parse JSON body

// Add security headers for video content
app.use(
  "/uploads",
  (req, res, next) => {
    res.setHeader("Content-Security-Policy", "default-src 'self'");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, private"
    );
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    next();
  },
  express.static("uploads")
); // Serve uploaded files

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/videos", videoRoutes); // Register video routes
app.use("/api/admin", adminRoutes); // Register admin routes

// Default route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
