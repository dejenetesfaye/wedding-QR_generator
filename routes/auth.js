const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { protect } = require("../middleware/auth");

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      username: user.username,
      role: user.role,
      token: generateToken(user._id),
    });
  } else {
    res.status(401).json({ message: "Invalid username or password" });
  }
});

// @desc    Register a new user (Usually done by admin)
// @route   POST /api/auth/register
// @access  Private (Admin Only)
router.post("/register", protect, async (req, res) => {
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({ message: "Not authorized as admin" });
  }

  const { name, username, password, role } = req.body;

  const userExists = await User.findOne({ username });

  if (userExists) {
    return res.status(400).json({ message: "User already exists" });
  }

  const user = await User.create({
    name,
    username,
    password,
    role: role || "MANAGER",
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      username: user.username,
      role: user.role,
      token: generateToken(user._id),
    });
  } else {
    res.status(400).json({ message: "Invalid user data" });
  }
});

// @desc    Get all users
// @route   GET /api/auth/users
// @access  Private (Admin Only)
router.get("/users", protect, async (req, res) => {
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({ message: "Not authorized as admin" });
  }
  const users = await User.find({}).select("-password");
  res.json(users);
});

// @desc    Delete a user
// @route   DELETE /api/auth/users/:id
// @access  Private (Admin Only)
router.delete("/users/:id", protect, async (req, res) => {
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({ message: "Not authorized as admin" });
  }

  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "Admin cannot delete themselves" });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

module.exports = router;
