const mongoose = require("mongoose");

const rsvpSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
  name: { type: String, required: true },
  phone: { type: String },
  attending: { type: Boolean, required: true },
  guestCount: { type: Number, default: 1 },
  message: { type: String }
}, { timestamps: true });

module.exports = mongoose.model("RSVP", rsvpSchema);
