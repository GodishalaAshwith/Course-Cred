const express = require("express");
const router = express.Router();
const Complaint = require("../models/Complaint");
const { adminMiddleware } = require("../middleware/adminMiddleware");
const { check, validationResult } = require("express-validator");

// Validation middleware
const validateComplaint = [
  check("name").trim().isLength({ min: 2 }).escape(),
  check("email").trim().isEmail().normalizeEmail(),
  check("subject").trim().isLength({ min: 5 }).escape(),
  check("message").trim().isLength({ min: 10 }).escape(),
];

// Public route - Submit a complaint
router.post("/", validateComplaint, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const complaint = new Complaint(req.body);
    await complaint.save();
    res.status(201).json({
      success: true,
      message: "Thank you for your feedback. We will get back to you soon.",
      complaint,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// Admin route - Get all complaints with pagination and filters
router.get("/", adminMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, sortBy = "-createdAt" } = req.query;
    const query = status ? { status } : {};

    const complaints = await Complaint.find(query)
      .sort(sortBy)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Complaint.countDocuments(query);

    res.json({
      complaints,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching complaints",
    });
  }
});

// Admin route - Update complaint status
router.patch("/:id", adminMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    if (!["pending", "in-progress", "resolved"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found",
      });
    }

    res.json({
      success: true,
      message: "Status updated successfully",
      complaint,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// Admin route - Get complaint statistics
router.get("/stats", adminMiddleware, async (req, res) => {
  try {
    const [pending, inProgress, resolved, total] = await Promise.all([
      Complaint.countDocuments({ status: "pending" }),
      Complaint.countDocuments({ status: "in-progress" }),
      Complaint.countDocuments({ status: "resolved" }),
      Complaint.countDocuments(),
    ]);

    res.json({
      success: true,
      stats: {
        pending,
        inProgress,
        resolved,
        total,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching statistics",
    });
  }
});

// Admin route - Delete all resolved complaints
router.delete("/resolved", adminMiddleware, async (req, res) => {
  try {
    const result = await Complaint.deleteMany({ status: "resolved" });

    res.json({
      success: true,
      message: `Successfully deleted ${result.deletedCount} resolved complaints`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting resolved complaints",
    });
  }
});

module.exports = router;
