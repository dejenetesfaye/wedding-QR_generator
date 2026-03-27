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

// @desc    Create a new event
// @route   POST /api/events
// @access  Private
router.post("/", protect, async (req, res) => {
  try {
    const { name, date, description } = req.body;
    
    // For local dev, we allow Managers to create events they own.
    const event = new Event({
      name,
      date,
      description,
      managerId: req.user._id
    });

    const createdEvent = await event.save();
    res.status(201).json(createdEvent);
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
