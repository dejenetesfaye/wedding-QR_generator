const express = require("express");
const router = express.Router();
const Event = require("../models/Event");
const Guest = require("../models/Guest");
const { protect } = require("../middleware/auth");

// @desc    Get all events for a specific manager
// @route   GET /api/events
// @access  Private (Manager/Admin)
router.get("/", protect, async (req, res) => {
  try {
    // Admins can see all events, Managers see only their own
    const filter = req.user.role === "ADMIN" ? {} : { managerId: req.user._id };
    const events = await Event.find(filter).sort({ createdAt: -1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// @desc    Get public event details by unique slug
// @route   GET /api/events/slug/:slug
// @access  Public
router.get("/slug/:slug", async (req, res) => {
  try {
    const event = await Event.findOne({ slug: { $regex: new RegExp(`^${req.params.slug}$`, "i") } });
    if (!event) {
      return res.status(404).json({ message: "Wedding not found" });
    }
    // Only return safe public data needed for the portal and website
    res.json({
      _id: event._id,
      name: event.name,
      qrCustomText: event.qrCustomText,
      groomName: event.groomName,
      brideName: event.brideName,
      date: event.date,
      templateId: event.templateId,
      weddingData: event.weddingData,
      isPublished: event.isPublished
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});


// @desc    Get event by ID
// @route   GET /api/events/:id
// @access  Private
router.get("/:id", protect, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    // Only allow Admin or the Event Owner to view the full private event details
    if (req.user.role !== "ADMIN" && event.managerId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized to view this event" });
    }
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// @desc    Create a new event
// @route   POST /api/events
// @access  Private
router.post("/", protect, async (req, res) => {
  try {
    const { name, date, description, qrCustomText, slug, groomName, brideName } = req.body;
    
    // For local dev, we allow Managers to create events they own.
    const event = new Event({
      name,
      slug,
      groomName,
      brideName,
      date,
      description,
      qrCustomText: qrCustomText || "Welcome to our wedding!",
      managerId: req.user._id
    });


    const createdEvent = await event.save();
    res.status(201).json(createdEvent);
  } catch (error) {
    if (error.code === 11000 && error.keyPattern && error.keyPattern.slug) {
      return res.status(400).json({ message: "This Unique Link Name is already taken. Please choose another one." });
    }
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// @desc    Update an event / wedding website details
// @route   PUT /api/events/:id
// @access  Private
router.put("/:id", protect, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Admins can update anything; Managers only their own
    if (req.user.role !== "ADMIN" && event.managerId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized to update this event" });
    }

    const { templateId, weddingData, isPublished, groomName, brideName, name, slug, date } = req.body;
    
    if (templateId !== undefined) event.templateId = templateId;
    if (weddingData !== undefined) event.weddingData = weddingData;
    if (isPublished !== undefined) event.isPublished = isPublished;
    if (groomName !== undefined) event.groomName = groomName;
    if (brideName !== undefined) event.brideName = brideName;
    if (name !== undefined) event.name = name;
    if (slug !== undefined) event.slug = slug;
    if (date !== undefined) event.date = date;

    const updatedEvent = await event.save();
    res.json(updatedEvent);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// @desc    Delete an event
// @route   DELETE /api/events/:id
// @access  Private
router.delete("/:id", protect, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Admins can delete anything; Managers only their own
    if (req.user.role !== "ADMIN" && event.managerId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized to delete this event" });
    }

    // 1. Delete all associated guests
    await Guest.deleteMany({ eventId: req.params.id });

    // 2. Delete the event itself
    await Event.findByIdAndDelete(req.params.id);

    res.json({ message: "Event and all associated guests deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

module.exports = router;
