require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");

mongoose.connect(process.env.MONGO_URI).then(async () => {
  console.log("Connected to DB");
  
  const userExists = await User.findOne({ username: "admin" });
  if (!userExists) {
    const admin = new User({
      name: "System Admin",
      username: "admin",
      password: "password123", // Will be hashed in pre-save hook
      role: "ADMIN"
    });
    await admin.save();
    console.log("✅ Default admin created! Username: admin, Password: password123");
  } else {
    console.log("✅ Admin already exists.");
  }
  
  process.exit();
}).catch(err => {
  console.error(err);
  process.exit(1);
});
