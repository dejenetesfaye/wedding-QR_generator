const express = require("express");
const router = express.Router();
const Guest = require("../models/Guest");
const Event = require("../models/Event");
const { v4: uuidv4 } = require("uuid");
const { protect } = require("../middleware/auth");
const { generatePDF } = require("../generatePDF");


// PUBLIC UNIVERSAL LOOKUP (No eventId needed, searches all events)
router.get("/lookup-universal", async (req, res) => {
  try {
    const phoneNumber = req.query.phone;
    
    if (!phoneNumber) {
      return res.status(400).json({ message: "Phone number is required." });
    }

    const escapedPhone = phoneNumber.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const guest = await Guest.findOne({ 
      phone: { $regex: escapedPhone, $options: 'i' } 
    }).sort({ createdAt: -1 });

    if (!guest) {
      return res.status(404).json({ message: "No invitation found for this phone number. 🔎" });
    }

    let eventInfo = { name: "Wedding Event", qrCustomText: "Welcome!" };
    if (guest.eventId) {
      try {
        const event = await Event.findById(guest.eventId);
        if (event) {
          eventInfo = {
            name: event.name,
            qrCustomText: event.qrCustomText || "Welcome to our wedding!"
          };
        }
      } catch (e) {
        console.error("Event lookup error:", e);
      }
    }

    res.json({
      guest,
      eventInfo
    });

  } catch (err) {
    console.error("Universal lookup crash:", err);
    res.status(500).json({ message: "Internal Server Error: " + err.message });
  }
});

// PUBLIC LOOKUP for guests (to download their own QR)
router.get("/lookup/:eventId/:phone", async (req, res) => {
  try {
    const { eventId, phone } = req.params;
    const guest = await Guest.findOne({ 
      eventId, 
      phone: { $regex: phone.trim(), $options: 'i' } 
    });

    if (!guest) {
      return res.status(404).json({ message: "Guest not found with that phone number. 🔎" });
    }

    const event = await Event.findById(eventId);
    res.json({
      guest,
      eventInfo: {
        name: event?.name,
        qrCustomText: event?.qrCustomText || "Welcome to our wedding!"
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET ALL GUESTS for a specific event
router.get("/:eventId", protect, async (req, res) => {

  const guests = await Guest.find({ eventId: req.params.eventId }).sort({ name: 1 });
  res.json(guests);
});

// STATS for a specific event
router.get("/:eventId/stats", protect, async (req, res) => {
  const total = await Guest.countDocuments({ eventId: req.params.eventId });
  const checkedIn = await Guest.countDocuments({ eventId: req.params.eventId, checkedIn: true });

  res.json({
    total,
    checkedIn,
    remaining: total - checkedIn
  });
});

// CHECK-IN guest (Protected or Secret Link depending on preference, currently open for the specific event URL)
// The EventId is not strictly needed for the check-in if the QR UUID is globally unique, but it adds safety.
router.post("/:id/checkin", async (req, res) => {
  try {
    const guest = await Guest.findOne({ id: req.params.id });

    if (!guest) {
      return res.status(404).json({ message: "Invalid QR ❌" });
    }

    if (guest.checkedIn) {
      return res.json({
        message: "Already checked-in ⚠️",
        guest
      });
    }

    guest.checkedIn = true;
    guest.checkedInAt = new Date();

    await guest.save();

    res.json({
      message: "Check-in successful ✅",
      guest
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// BULK GENERATE guests from list for a specific EVENT and regenerate PDF
// Accepts { eventId, guests: [{ name, phone }] }
router.post("/generate", protect, async (req, res) => {
  const { eventId, guests } = req.body;

  if (!eventId) {
    return res.status(400).json({ message: "eventId is required" });
  }

  if (!Array.isArray(guests) || guests.length === 0) {
    console.log("Generate Error: guests array is missing or empty");
    return res.status(400).json({ message: "guests list is required" });
  }

  try {
    const newGuests = guests.map((g) => ({
      id: uuidv4(),
      name: (g.name || "Guest").trim(),
      phone: (g.phone || "").trim(),
      invited: true,
      checkedIn: false,
      checkedInAt: null,
      eventId: eventId
    }));

    console.log(`Saving ${newGuests.length} guests to DB for Event ${eventId}...`);
    await Guest.insertMany(newGuests);
    
    console.log("Guests saved. Generating PDF inside process...");
    
    // Call the module directly (NO EXTRA PROCESS SPAWNED!)
    await generatePDF(eventId);

    res.json({
      message: `✅ Successfully created ${newGuests.length} guest(s) and updated qrcodes.pdf!`,
      count: newGuests.length
    });

  } catch (err) {
    console.error("Generate route error:", err);
    res.status(500).json({ error: err.message });
  }
});

// GET guest by ID (for scanning)
router.get("/guest/:id", async (req, res) => {
  try {
    const guest = await Guest.findOne({ id: req.params.id });

    if (!guest) {
      return res.status(404).json({ message: "Invalid QR ❌" });
    }

    res.json(guest);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUBLIC LOOKUP for guests (to download their own QR)
router.get("/lookup/:eventId/:phone", async (req, res) => {
  try {
    const { eventId, phone } = req.params;
    
    // Exact match or contains (be careful with formatting)
    const guest = await Guest.findOne({ 
      eventId, 
      phone: { $regex: phone.trim(), $options: 'i' } 
    });

    if (!guest) {
      return res.status(404).json({ message: "Guest not found with that phone number. 🔎" });
    }

    // Also get event details to provide the custom text
    const event = await Event.findById(eventId);

    res.json({
      guest,
      eventInfo: {
        name: event?.name,
        qrCustomText: event?.qrCustomText || "Welcome to our wedding!"
      }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUBLIC UNIVERSAL LOOKUP (No eventId needed, searches all events)
router.get("/lookup-universal", async (req, res) => {
  try {
    const phoneNumber = req.query.phone;
    
    if (!phoneNumber) {
      return res.status(400).json({ message: "Phone number is required." });
    }

    // Escape special characters (like +) for regex
    const escapedPhone = phoneNumber.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Search for guest by phone across ALL events
    const guest = await Guest.findOne({ 
      phone: { $regex: escapedPhone, $options: 'i' } 
    }).sort({ createdAt: -1 });

    if (!guest) {
      return res.status(404).json({ message: "No invitation found for this phone number. 🔎" });
    }

    // Defensive check: Ensure eventId exists to avoid 500 crash
    let eventInfo = { name: "Wedding Event", qrCustomText: "Welcome!" };
    if (guest.eventId) {
      try {
        const event = await Event.findById(guest.eventId);
        if (event) {
          eventInfo = {
            name: event.name,
            qrCustomText: event.qrCustomText || "Welcome to our wedding!"
          };
        }
      } catch (e) {
        console.error("Event lookup error:", e);
      }
    }

    res.json({
      guest,
      eventInfo
    });

  } catch (err) {
    console.error("Universal lookup crash:", err);
    res.status(500).json({ message: "Internal Server Error: " + err.message });
  }
});


module.exports = router;