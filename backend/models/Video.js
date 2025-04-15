const mongoose = require("mongoose");

const VideoSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    filename: { type: String, required: true },
    description: { type: String },
    uploadDate: { type: Date, default: Date.now },
    credits: { type: Number, required: true },
    difficulty: { type: String },
    topics: [String],
    summary: { type: String },
    uniqueness: { type: Number, default: 50 }, // Added uniqueness score
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Video", VideoSchema);
