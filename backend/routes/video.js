const express = require("express");
const multer = require("multer");
const path = require("path");
const { spawn } = require("child_process");
const fs = require("fs");
const Video = require("../models/Video");
const User = require("../models/User");
const Transaction = require("../models/Transaction");
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

      // Get all existing videos for comparison
      const existingVideos = await Video.find(
        {},
        "videoFingerprint owner"
      ).lean();

      // Format existing videos data for Python script
      const videosData = {
        videos: existingVideos.map((v) => ({
          fingerprint: v.videoFingerprint,
          owner: v.owner.toString(),
        })),
        current_user: req.user.id,
      };

      // Run Python script for video analysis
      const pythonProcess = spawn("python", [
        "server.py",
        "--analyze",
        req.file.path,
        "--existing-videos",
        JSON.stringify(videosData),
      ]);

      let analysisData = "";

      pythonProcess.stdout.on("data", (data) => {
        analysisData += data.toString();
      });

      pythonProcess.stderr.on("data", (data) => {
        console.error(`Python Error: ${data}`);
      });

      pythonProcess.on("close", async (code) => {
        // Clean up the uploaded file regardless of result
        if (req.file && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }

        if (code !== 0) {
          return res.status(500).json({ message: "Analysis failed" });
        }
        try {
          const result = JSON.parse(analysisData);
          res.json(result);
        } catch (err) {
          console.error("Parse error:", err);
          res.status(500).json({ message: "Failed to parse analysis results" });
        }
      });
    } catch (err) {
      // Clean up the uploaded file in case of error
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
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
      if (!user) {
        // Clean up file if user not found
        if (req.file && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(404).json({ message: "User not found" });
      }

      const {
        title,
        credits,
        summary,
        difficulty,
        topics,
        uniqueness,
        fingerprint,
        similarity_message,
      } = req.body;

      // Check if the video should receive credits
      const finalCredits = parseInt(credits) || 0;
      if (finalCredits === 0) {
        // Clean up file if it's a duplicate
        if (req.file && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(400).json({
          message:
            "This video appears to be a duplicate. No credits will be awarded.",
          similarity_message,
        });
      }

      const videoData = {
        title: title || "Untitled Video",
        filename: req.file.filename,
        credits: finalCredits,
        summary,
        difficulty,
        topics: topics ? topics.split(",").map((t) => t.trim()) : [],
        uniqueness: parseInt(uniqueness) || 50,
        videoFingerprint: fingerprint,
        owner: req.user.id,
      };

      const video = new Video(videoData);
      await video.save();

      // Update user's total credits
      user.totalCredits = (user.totalCredits || 0) + finalCredits;
      await user.save();

      // Delete the video file after successful save
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      res.status(201).json({
        message: "Video uploaded successfully",
        video,
        similarity_message: similarity_message || "Original content",
      });
    } catch (err) {
      // Clean up file in case of error
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
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

// Get Recent Transactions Route
router.get("/transactions", authMiddleware, async (req, res) => {
  try {
    const transactions = await Transaction.find({
      $or: [{ buyer: req.user.id }, { seller: req.user.id }],
    })
      .populate({
        path: "video",
        select: "title _id",
      })
      .populate({
        path: "buyer",
        select: "name _id",
      })
      .populate({
        path: "seller",
        select: "name _id",
      })
      .sort({ createdAt: -1 })
      .lean()
      .limit(10);

    res.json(transactions);
  } catch (err) {
    res.status(500).json({
      error: "Server error",
      details: err.message,
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
  }
});

// Purchase Video Route
router.post("/purchase/:id", authMiddleware, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    const buyer = await User.findById(req.user.id);
    const seller = await User.findById(video.owner);

    // Check if user has already purchased the video
    if (buyer.purchasedVideos.includes(video._id)) {
      return res.status(400).json({ message: "You already own this video" });
    }

    // Check if user has enough credits
    if (buyer.totalCredits < video.credits) {
      return res.status(400).json({ message: "Insufficient credits" });
    }

    // Create transaction
    const transaction = new Transaction({
      buyer: buyer._id,
      seller: seller._id,
      video: video._id,
      credits: video.credits,
    });
    await transaction.save();

    // Update buyer's credits and purchased videos
    buyer.totalCredits -= video.credits;
    buyer.purchasedVideos.push(video._id);
    await buyer.save();

    // Update seller's credits
    seller.totalCredits += video.credits;
    await seller.save();

    res.json({
      message: "Video purchased successfully",
      transaction: transaction,
    });
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

// Delete Video Route
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    // Check if user owns the video
    if (video.owner.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this video" });
    }

    // Find user and update their credits
    const user = await User.findById(req.user.id);
    if (user) {
      user.totalCredits = Math.max(0, (user.totalCredits || 0) - video.credits);
      await user.save();
    }

    // Delete the video file
    const videoPath = path.join(__dirname, "../uploads/videos", video.filename);
    if (fs.existsSync(videoPath)) {
      fs.unlinkSync(videoPath);
    }

    // Delete from database
    await video.deleteOne();

    res.json({ message: "Video deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
