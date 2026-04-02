const express = require("express");
const router = express.Router();
const Template = require("../models/Template");

// @desc    Get all available templates
// @route   GET /api/templates
// @access  Public
router.get("/", async (req, res) => {
  try {
    const templates = await Template.find();
    res.json(templates);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// Seed templates manually if requested
router.post("/seed", async (req, res) => {
  try {
    const count = await Template.countDocuments();
    if (count === 0) {
      await Template.insertMany([
        { name: "Elegant Gold", componentRef: "Template1", previewImage: "https://via.placeholder.com/300x400?text=Elegant+Gold" },
        { name: "Modern Minimal", componentRef: "Template2", previewImage: "https://via.placeholder.com/300x400?text=Modern+Minimal" }
      ]);
      return res.json({ message: "Templates seeded!" });
    }
    res.json({ message: "Templates already exist." });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

module.exports = router;
