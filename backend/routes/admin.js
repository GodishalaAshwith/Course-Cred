const express = require("express");
const router = express.Router();
const { adminMiddleware } = require("../middleware/adminMiddleware");
const User = require("../models/User");
const Video = require("../models/Video");
const Transaction = require("../models/Transaction");
const bcrypt = require("bcryptjs");

// Admin login with secret code
router.post("/login", async (req, res) => {
  try {
    const { email, password, adminPassword } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Verify admin password
    if (adminPassword !== "admin") {
      return res.status(403).json({ message: "Invalid admin password" });
    }

    // Set user as admin if not already
    if (!user.isAdmin) {
      user.isAdmin = true;
      await user.save();
    }

    res.json({ message: "Admin access granted", isAdmin: true });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get all users
router.get("/users", adminMiddleware, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Update user
router.put("/users/:id", adminMiddleware, async (req, res) => {
  try {
    const { name, email, totalCredits, isAdmin } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.totalCredits =
      totalCredits !== undefined ? totalCredits : user.totalCredits;
    user.isAdmin = isAdmin !== undefined ? isAdmin : user.isAdmin;

    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Delete user
router.delete("/users/:id", adminMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete all user's videos
    await Video.deleteMany({ owner: user._id });

    // Delete all related transactions
    await Transaction.deleteMany({
      $or: [{ buyer: user._id }, { seller: user._id }],
    });

    await user.deleteOne();
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get all videos
router.get("/videos", adminMiddleware, async (req, res) => {
  try {
    const videos = await Video.find().populate("owner", "name email");
    res.json(videos);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Update video
router.put("/videos/:id", adminMiddleware, async (req, res) => {
  try {
    const { title, credits, difficulty, topics, summary } = req.body;
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    video.title = title || video.title;
    video.credits = credits !== undefined ? credits : video.credits;
    video.difficulty = difficulty || video.difficulty;
    video.topics = topics || video.topics;
    video.summary = summary || video.summary;

    await video.save();
    res.json(video);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get all transactions
router.get("/transactions", adminMiddleware, async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate("buyer", "name email")
      .populate("seller", "name email")
      .populate("video", "title");
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get dashboard stats
router.get("/stats", adminMiddleware, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalVideos = await Video.countDocuments();
    const totalTransactions = await Transaction.countDocuments();
    const totalCreditsInSystem = await User.aggregate([
      { $group: { _id: null, total: { $sum: "$totalCredits" } } },
    ]);

    const recentTransactions = await Transaction.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("buyer", "name")
      .populate("seller", "name")
      .populate("video", "title");

    res.json({
      totalUsers,
      totalVideos,
      totalTransactions,
      totalCreditsInSystem: totalCreditsInSystem[0]?.total || 0,
      recentTransactions,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
