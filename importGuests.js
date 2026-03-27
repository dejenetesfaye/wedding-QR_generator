require("dotenv").config();
const mongoose = require("mongoose");
const fs = require("fs");
const csv = require("csv-parser");
const { v4: uuidv4 } = require("uuid");
const Guest = require("./models/Guest");

mongoose.connect(process.env.MONGO_URI);

const results = [];

fs.createReadStream("guests.csv")
  .pipe(csv())
  .on("data", (data) => {
    results.push({
      id: uuidv4(), // unique QR ID
      name: data.name,
      phone: data.phone || "",
      invited: true,
      checkedIn: false,
      checkedInAt: null
    });
  })
  .on("end", async () => {
    try {
      await Guest.insertMany(results);
      console.log("✅ Guests imported successfully");
      process.exit();
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  });