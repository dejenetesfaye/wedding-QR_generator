const express = require("express");
const router = express.Router();
const RSVP = require("../models/RSVP");
const Event = require("../models/Event");
const { protect } = require("../middleware/auth");

// @desc    Submit an RSVP (Public)
// @route   POST /api/rsvp/:eventId
// @access  Public
router.post("/:eventId", async (req, res) => {
  try {
    const { name, phone, attending, guestCount, message } = req.body;
    
    // Ensure the event exists
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ message: "Wedding not found" });
    }

    const rsvp = new RSVP({
      eventId: event._id,
      name,
      phone,
      attending,
      guestCount: attending ? guestCount : 0,
      message
    });

    await rsvp.save();
    res.status(201).json({ message: "Thank you for responding!" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// @desc    Get all RSVPs for an event
// @route   GET /api/rsvp/:eventId
// @access  Private
router.get("/:eventId", protect, async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Admins can see all, managers only their own
    if (req.user.role !== "ADMIN" && event.managerId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized to view these RSVPs" });
    }

    const rsvps = await RSVP.find({ eventId: req.params.eventId }).sort({ createdAt: -1 });
    res.json(rsvps);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

module.exports = router;
