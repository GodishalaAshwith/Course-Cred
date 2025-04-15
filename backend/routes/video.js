const express = require("express");
const multer = require("multer");
const path = require("path");
const { spawn } = require("child_process");
const Video = require("../models/Video");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/videos");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// Analyze Video Route
router.post(
  "/analyze",
  authMiddleware,
  upload.single("video"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No video file uploaded" });
      }

      // Run Python script for video analysis
      const pythonProcess = spawn("python", [
        "server.py",
        "--analyze",
        req.file.path,
      ]);

      let analysisData = "";

      pythonProcess.stdout.on("data", (data) => {
        analysisData += data.toString();
      });

      pythonProcess.stderr.on("data", (data) => {
        console.error(`Python Error: ${data}`);
      });

      pythonProcess.on("close", (code) => {
        if (code !== 0) {
          return res.status(500).json({ message: "Analysis failed" });
        }
        try {
          const result = JSON.parse(analysisData);
          res.json(result);
        } catch (err) {
          res.status(500).json({ message: "Failed to parse analysis results" });
        }
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Upload Video Route
router.post(
  "/upload",
  authMiddleware,
  upload.single("video"),
  async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
      if (!user) return res.status(404).json({ message: "User not found" });

      const { title, credits, summary, difficulty, topics, uniqueness } =
        req.body;
      const videoData = {
        title: title || "Untitled Video",
        filename: req.file.filename,
        credits: parseInt(credits) || 0,
        summary,
        difficulty,
        topics: topics ? topics.split(",").map((t) => t.trim()) : [],
        uniqueness: parseInt(uniqueness) || 50,
        owner: req.user.id,
      };

      const video = new Video(videoData);
      await video.save();

      // Update user's total credits
      user.totalCredits = (user.totalCredits || 0) + (parseInt(credits) || 0);
      await user.save();

      res.status(201).json({ message: "Video uploaded successfully", video });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Get User Videos Route
router.get("/user-videos", authMiddleware, async (req, res) => {
  try {
    const videos = await Video.find({ owner: req.user.id }).sort({
      createdAt: -1,
    });
    res.json(videos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get All Public Videos Route
router.get("/all", async (req, res) => {
  try {
    const videos = await Video.find()
      .sort({ createdAt: -1 })
      .populate("owner", "name");
    res.json(videos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get Video by ID Route
router.get("/:id", async (req, res) => {
  try {
    const video = await Video.findById(req.params.id).populate("owner", "name");
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }
    res.json(video);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
