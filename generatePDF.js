const QRCode = require("qrcode");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const Guest = require("./models/Guest");

/**
 * Generates/Updates the qrcodes.pdf for a specific event.
 * Uses the existing Mongoose connection.
 */
const generatePDF = async (eventId) => {
  if (!eventId) {
    throw new Error("No eventId provided to generatePDF.");
  }

  const guests = await Guest.find({ eventId });

  if (guests.length === 0) {
    console.log("No guests found for this event. Skipping PDF.");
    return;
  }

  const doc = new PDFDocument({ margin: 20 });
  const stream = fs.createWriteStream("qrcodes.pdf");
  doc.pipe(stream);

  const qrSize = 100;
  const margin = 20;
  const pageWidth = doc.page.width;

  const itemsPerRow = Math.floor((pageWidth - margin * 2) / (qrSize + margin + 15));
  let x = margin;
  let y = margin;
  let count = 0;

  for (const guest of guests) {
    // User manual change (Keep invitation text as requested)
    const baseUrl = `Dear ${guest.name}, you are invited to Bamlak and Yohanes weeding.`;
    const designCredit = "Designed by Malda Decor (+251 91183 4473)";
    const qrData = `${baseUrl} / ${designCredit} ID:${guest.id}`;

    // Draw card border
    doc.roundedRect(x - 10, y - 10, qrSize + 20, qrSize + 40, 8)
      .lineWidth(1.5)
      .strokeColor("#E5E7EB")
      .stroke();

    const qrImage = await QRCode.toDataURL(qrData, {
      width: qrSize,
      margin: 4,
      color: { dark: "#1E3A8A", light: "#FFFFFF" },
      errorCorrectionLevel: "M"
    });

    const base64Data = qrImage.replace(/^data:image\/png;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");
    doc.image(buffer, x, y, { width: qrSize });

    // Logo overlay removed for faster scanning
    
    doc.fillColor("#374151")
      .fontSize(8)
      .text(guest.name, x, y + qrSize + 8, {
        width: qrSize, align: "center"
      });

    count++;
    x += qrSize + margin + 20;

    if (count % itemsPerRow === 0) {
      x = margin;
      y += qrSize + 60;
    }

    if (y + qrSize + 40 > doc.page.height) {
      doc.addPage();
      x = margin;
      y = margin;
    }
  }

  // Use a Promise to wait for the FILE STREAM to fully finish writing
  await new Promise((resolve, reject) => {
    stream.on("finish", resolve);
    stream.on("error", reject);
    doc.end();
  });

  console.log(`✅ PDF fully written for event ${eventId}: qrcodes.pdf`);
};

module.exports = { generatePDF };