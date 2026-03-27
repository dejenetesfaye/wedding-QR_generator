const mongoose = require("mongoose");
const Guest = require("./models/Guest");

const uri = "mongodb+srv://deju:Deju1921%40TETH%23@cluster0.betz1hn.mongodb.net/qr-invitation?retryWrites=true&w=majority";

mongoose.connect(uri)
    .then(async () => {
        console.log("✅ Connected");

        // First guest
        const guest1 = new Guest({
            name: "Write Test 1",
            phone: "0000000000",
            table: "Test",
            qrCode: "TEST001"
        });
        await guest1.save();

        // Second guest
        const guest2 = new Guest({
            name: "Write Test 2",
            phone: "1111111111",
            table: "Test",
            qrCode: "TEST002"
        });
        await guest2.save();

        console.log("✅ Both guests inserted successfully!");
        process.exit(0);
    })
    .catch(err => {
        console.error("❌ Error:", err);
        process.exit(1);
    });