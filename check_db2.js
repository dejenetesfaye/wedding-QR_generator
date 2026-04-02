const path = require('path');
require("dotenv").config({ path: path.join(__dirname, '.env') });
const mongoose = require("mongoose");
const Event = require("./models/Event");

const uri = "mongodb+srv://deju:Deju1921%40TETH%23@cluster0.betz1hn.mongodb.net/qr-invitation?retryWrites=true&w=majority";

mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 })
  .then(async () => {
    console.log("✅ Connected to MongoDB.");
    
    // Update the most recent event that lacks groomName/brideName with something
    const latestEvent = await Event.findOne().sort({ createdAt: -1 });
    if (latestEvent) {
      if (!latestEvent.groomName) {
        latestEvent.groomName = "John";
        latestEvent.brideName = "Jane";
        await latestEvent.save();
        console.log("UPDATED missing fields for latest event!");
      }
    }
    
    const events = await Event.find().sort({ createdAt: -1 }).limit(3);
    console.log("Last 3 events:\n", events.map(e => ({
        name: e.name, 
        slug: e.slug, 
        groomName: e.groomName, 
        brideName: e.brideName 
    })));
    process.exit(0);
  })
  .catch(err => {
    console.error("❌ Error:", err);
    process.exit(1);
  });
