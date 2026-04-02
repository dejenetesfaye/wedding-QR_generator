const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  groomName: { type: String },
  brideName: { type: String },
  date: { type: Date, required: true },
  managerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  description: { type: String },
  qrCustomText: { type: String, default: "Welcome to our wedding!" },
  templateId: { type: mongoose.Schema.Types.ObjectId, ref: "Template" },
  weddingData: { type: Object, default: {} },
  isPublished: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model("Event", eventSchema);
