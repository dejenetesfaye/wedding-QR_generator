const QRCode = require("qrcode");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const Guest = require("./models/Guest");
const Event = require("./models/Event");

/**
 * Generates/Updates the qrcodes.pdf for a specific event.
 */
const generatePDF = async (eventId) => {
  if (!eventId) {
    throw new Error("No eventId provided to generatePDF.");
  }

  const [guests, event] = await Promise.all([
    Guest.find({ eventId }),
    Event.findById(eventId)
  ]);

  if (guests.length === 0) {
    console.log("No guests found for this event. Skipping PDF.");
    return;
  }

  const qrCustomText = event?.qrCustomText || "Welcome to our wedding!";

  const doc = new PDFDocument({ margin: 20 });
  const stream = fs.createWriteStream("qrcodes.pdf");
  doc.pipe(stream);

  const cardW = 160;
  const cardH = 220;
  const margin = 25;
  const pageWidth = doc.page.width;

  const itemsPerRow = Math.floor((pageWidth - margin * 2) / (cardW + margin));
  let x = margin;
  let y = margin;
  let count = 0;

  for (const guest of guests) {
    const qrData = `${qrCustomText.trim()} #ID:${guest.id}`;


    // 1. Draw Golden Background (Sunburst effect is tricky in PDFkit without many lines, so we'll use a soft gold fill)
    doc.save();
    doc.roundedRect(x, y, cardW, cardH, 12).clip();
    doc.fillColor("#FFFBF2").rect(x, y, cardW, cardH).fill();
    
    // Draw Sunburst Rays (Simplified for PDF)
    doc.fillColor("#F9E2AF");
    const rays = 12;
    const cx = x + cardW / 2;
    const cy = y + cardH / 2;
    for (let i = 0; i < rays; i++) {
        const start = (i * 2 * Math.PI) / rays;
        const end = ((i + 0.4) * 2 * Math.PI) / rays;
        doc.moveTo(cx, cy)
           .lineTo(cx + Math.cos(start) * 300, cy + Math.sin(start) * 300)
           .lineTo(cx + Math.cos(end) * 300, cy + Math.sin(end) * 300)
           .fill();
    }
    doc.restore();

    // 2. White Card Overlay
    const padding = 15;
    doc.roundedRect(x + padding, y + padding, cardW - padding * 2, cardH - padding * 2, 8)
       .fillColor("#FFFFFF")
       .fill();

    // 3. Header "Welcome" & Guest Name
    doc.fillColor("#B8860B")
       .fontSize(16)
       .font("Helvetica-Bold")
       .text("Welcome", x, y + 25, { width: cardW, align: "center" });

    // Stylish Guest Name (Italic)
    doc.fillColor("#D4AF37")
       .fontSize(10)
       .font("Helvetica-BoldOblique")
       .text(guest.name, x, y + 45, { width: cardW, align: "center" });

    // 4. QR Code (Pushed down slightly)
    const qrImage = await QRCode.toDataURL(qrData, {
      width: 400,
      margin: 1,
      color: { dark: "#000000", light: "#FFFFFF" },
      errorCorrectionLevel: "Q"
    });

    const base64Data = qrImage.replace(/^data:image\/png;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");
    doc.image(buffer, x + 35, y + 75, { width: 90 });

    // 5. Footer "Show me at the gate"
    doc.fillColor("#B8860B")
       .fontSize(10)
       .text("Show me at the gate", x, y + 175, { width: cardW, align: "center" });


    // 7. Outer Luxury Border
    doc.roundedRect(x, y, cardW, cardH, 12)
       .lineWidth(1)
       .strokeColor("#D4AF37")
       .stroke();

    count++;
    x += cardW + margin;

    if (count % itemsPerRow === 0) {
      x = margin;
      y += cardH + margin;
    }

    if (y + cardH + margin > doc.page.height) {
      doc.addPage();
      x = margin;
      y = margin;
    }
  }

  await new Promise((resolve, reject) => {
    stream.on("finish", resolve);
    stream.on("error", reject);
    doc.end();
  });

  console.log(`✅ Stylish PDF fully written for event ${eventId}: qrcodes.pdf`);
};

module.exports = { generatePDF };