const mongoose = require("mongoose");

const templateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  previewImage: { type: String },
  externalUrl: { type: String, required: true },
  description: { type: String },
  slug: { type: String, unique: true, lowercase: true, trim: true }
}, { timestamps: true });

module.exports = mongoose.model("Template", templateSchema);
