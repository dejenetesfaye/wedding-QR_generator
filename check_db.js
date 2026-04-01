require("dotenv").config();
const mongoose = require("mongoose");
const Event = require("./models/Event");

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log("Connected to MongoDB.");
    const events = await Event.find().sort({ createdAt: -1 }).limit(3);
    console.log("Last 3 events:", events.map(e => ({
        name: e.name, 
        slug: e.slug, 
        groomName: e.groomName, 
        brideName: e.brideName 
    })));
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
