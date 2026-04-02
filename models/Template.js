const mongoose = require("mongoose");

const templateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  previewImage: { type: String },
  componentRef: { type: String, required: true } // e.g., "Template1", "Template2"
}, { timestamps: true });

module.exports = mongoose.model("Template", templateSchema);
