const express = require("express");
const router = express.Router();
const Template = require("../models/Template");
const { protect } = require("../middleware/auth");

// @desc    Get all available templates
// @route   GET /api/templates
// @access  Public (So anybody can view the portfolio if needed)
router.get("/", async (req, res) => {
  try {
    const templates = await Template.find().sort({ createdAt: -1 });
    res.json(templates);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// @desc    Create a new template link
// @route   POST /api/templates
// @access  Private (Admin/Manager)
router.post("/", protect, async (req, res) => {
  try {
    const { name, previewImage, externalUrl, description, slug } = req.body;
    const template = new Template({
      name,
      previewImage,
      externalUrl,
      description,
      slug
    });
    const savedTemplate = await template.save();
    res.status(201).json(savedTemplate);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Template slug already exists." });
    }
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// @desc    Update a template
// @route   PUT /api/templates/:id
// @access  Private
router.put("/:id", protect, async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);
    if (!template) return res.status(404).json({ message: "Template not found" });

    const { name, previewImage, externalUrl, description, slug } = req.body;
    if (name !== undefined) template.name = name;
    if (previewImage !== undefined) template.previewImage = previewImage;
    if (externalUrl !== undefined) template.externalUrl = externalUrl;
    if (description !== undefined) template.description = description;
    if (slug !== undefined) template.slug = slug;

    const updatedTemplate = await template.save();
    res.json(updatedTemplate);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// @desc    Delete a template
// @route   DELETE /api/templates/:id
// @access  Private
router.delete("/:id", protect, async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);
    if (!template) return res.status(404).json({ message: "Template not found" });

    await Template.findByIdAndDelete(req.params.id);
    res.json({ message: "Template deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

module.exports = router;
