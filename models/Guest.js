const mongoose = require("mongoose");

const guestSchema = new mongoose.Schema({
  id: { type: String, unique: true },
  name: String,
  phone: String,
  invited: { type: Boolean, default: true },
  checkedIn: { type: Boolean, default: false },
  checkedInAt: { type: Date, default: null },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true }
});

module.exports = mongoose.model("Guest", guestSchema);