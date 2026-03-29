import QRCode from "qrcode";

/**
 * Generates the "Luxury Framed" canvas for an individual guest.
 */
export const generateLuxuryQRCanvas = async (guest, customText) => {
  if (!guest || !guest.id) return null;

  // 1. Generate the QR Data
  const qrData = `${customText?.trim() || "Welcome"} #ID:${guest.id}`;

  // 2. Create a canvas
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  
  const w = 800;
  const h = 1100;
  canvas.width = w;
  canvas.height = h;

  // 3. Draw Golden Sunburst Background
  const centerX = w / 2;
  const centerY = h / 2;
  
  // Solid background
  ctx.fillStyle = "#FFFBF2";
  ctx.fillRect(0, 0, w, h);

  // Sunburst rays
  ctx.fillStyle = "#F9E2AF";
  const rays = 20;
  for (let i = 0; i < rays; i++) {
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      const startAngle = (i * 2 * Math.PI) / rays;
      const endAngle = ((i + 0.5) * 2 * Math.PI) / rays;
      ctx.arc(centerX, centerY, Math.max(w, h), startAngle, endAngle);
      ctx.lineTo(centerX, centerY);
      ctx.fill();
  }

  // White Overlay for QR area
  const qrBoxW = 600;
  const qrBoxH = 850;
  ctx.fillStyle = "white";
  ctx.shadowBlur = 30;
  ctx.shadowColor = "rgba(0,0,0,0.15)";
  ctx.fillRect((w - qrBoxW) / 2, (h - qrBoxH) / 2, qrBoxW, qrBoxH);
  ctx.shadowBlur = 0; // reset

  // 4. Draw "Welcome" Header & Guest Name
  ctx.fillStyle = "#B8860B";
  ctx.font = "bold 80px 'Outfit', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Welcome", w / 2, 220);

  // Stylish Guest Name (Italic & Golden)
  ctx.fillStyle = "#D4AF37";
  ctx.font = "italic bold 55px 'Outfit', sans-serif";
  ctx.fillText(guest.name, w / 2, 290);

  // 5. Generate QR Code (Pushed down slightly)
  const qrCanvas = document.createElement("canvas");
  await QRCode.toCanvas(qrCanvas, qrData, {
    width: 450,
    margin: 1,
    color: { dark: "#000000", light: "#ffffff" },
    errorCorrectionLevel: "Q"
  });
  ctx.drawImage(qrCanvas, (w - 450) / 2, 360);

  // 6. Draw Footer Text
  ctx.fillStyle = "#B8860B";
  ctx.font = "bold 44px 'Outfit', sans-serif";
  ctx.fillText("Show me at the gate", w / 2, 880);

  // 8. LUXURY BORDER
  ctx.strokeStyle = "white";
  ctx.lineWidth = 15;
  ctx.strokeRect(40, 40, w - 80, h - 80);
  ctx.strokeStyle = "#D4AF37";
  ctx.lineWidth = 4;
  ctx.strokeRect(55, 55, w - 110, h - 110);

  return canvas;
};

/**
 * Downloads the luxury QR code as PNG.
 */
export const downloadGuestQR = async (guest, customText) => {
  const canvas = await generateLuxuryQRCanvas(guest, customText);
  if (!canvas) return;

  const link = document.createElement("a");
  link.download = `Invitation_${guest.name.replace(/\s+/g, "_")}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
};


