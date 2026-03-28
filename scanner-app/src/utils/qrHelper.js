import QRCode from "qrcode";

/**
 * Generates a "Beautifully Framed" QR code for an individual guest and downloads it as PNG.
 * Includes the guest's name and a clean border.
 */
export const downloadGuestQR = async (guest) => {
  if (!guest || !guest.id) return;

  try {
    // 1. Generate the standard QR Data (matching the PDF format)
    const baseUrl = `Dear ${guest.name}, you are invited to Bamlak and Yohanes weeding.`;
    const designCredit = "Designed by Malda Decor (+251 91183 4473)";
    const qrData = `${baseUrl} / ${designCredit} ID:${guest.id}`;

    // 2. Create a canvas for the "Frame"
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    
    const qrSize = 600;      // High resolution for printing
    const padding = 60;     // Space for the frame
    const textHeight = 80;   // Space for the name at the bottom
    
    canvas.width = qrSize + (padding * 2);
    canvas.height = qrSize + (padding * 2) + textHeight;

    // 3. Draw the background and frame
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle blue border (matching the theme)
    ctx.strokeStyle = "#1E3A8B";
    ctx.lineWidth = 10;
    ctx.strokeRect(padding / 2, padding / 2, canvas.width - padding, canvas.height - padding);

    // 4. Generate the QR Code onto a temporary canvas
    const qrCanvas = document.createElement("canvas");
    await QRCode.toCanvas(qrCanvas, qrData, {
      width: qrSize,
      margin: 2,
      color: { dark: "#000000", light: "#ffffff" },
      errorCorrectionLevel: "Q"
    });

    // 5. Draw QR onto the main canvas
    ctx.drawImage(qrCanvas, padding, padding);

    // 6. Draw Guest Name
    ctx.fillStyle = "#1E3A8B";
    ctx.font = "bold 42px 'Outfit', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(guest.name.toUpperCase(), canvas.width / 2, canvas.height - 60);

    // 7. Trigger download
    const link = document.createElement("a");
    link.download = `Wedding_QR_${guest.name.replace(/\s+/g, "_")}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();

  } catch (err) {
    console.error("Failed to generate individual QR:", err);
    alert("Could not generate individual QR code.");
  }
};
