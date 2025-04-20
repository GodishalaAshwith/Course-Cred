const jwt = require("jsonwebtoken");
const User = require("../models/User");
require("dotenv").config();

// Random secret code generator
let currentSecretCode = null;
let secretCodeTimestamp = null;
const CODE_EXPIRY_TIME = 5 * 60 * 1000; // 5 minutes in milliseconds

function generateNewSecretCode() {
  const code = Math.random().toString(36).substring(2, 8).toUpperCase();
  currentSecretCode = code;
  secretCodeTimestamp = Date.now();
  console.log("\n=== NEW ADMIN ACCESS CODE ===");
  console.log(`Code: ${code}`);
  console.log("Valid for 5 minutes");
  console.log("==========================\n");
  return code;
}

// Generate initial code
generateNewSecretCode();

// Regenerate code every 5 minutes
setInterval(generateNewSecretCode, CODE_EXPIRY_TIME);

const adminMiddleware = async (req, res, next) => {
  try {
    // First verify the JWT token
    const token = req.header("Authorization")?.split(" ")[1];
    if (!token) {
      return res
        .status(401)
        .json({ message: "No token, authorization denied" });
    }

    // Verify token and get user
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    if (!user.isAdmin) {
      return res.status(403).json({ message: "Not authorized as admin" });
    }

    // Check secret code if it's the initial admin access
    const providedCode = req.header("Admin-Access-Code");
    if (providedCode) {
      // Verify the provided code
      if (
        providedCode !== currentSecretCode ||
        Date.now() - secretCodeTimestamp > CODE_EXPIRY_TIME
      ) {
        return res
          .status(403)
          .json({ message: "Invalid or expired access code" });
      }
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: "Token is invalid" });
  }
};

module.exports = { adminMiddleware, generateNewSecretCode };
