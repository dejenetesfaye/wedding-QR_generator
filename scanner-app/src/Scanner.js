import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

export default function Scanner({ onScan }) {
  const [error, setError] = useState(null);
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef(null);
  const isTransitioning = useRef(false);
  const onScanRef = useRef(onScan);

  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  const startScanner = async () => {
    if (isTransitioning.current) return;
    isTransitioning.current = true;
    
    try {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode("reader");
      }

      // Don't start if already scanning
      if (scannerRef.current.isScanning) {
        isTransitioning.current = false;
        return;
      }

      const qrConfig = { fps: 10, qrbox: { width: 250, height: 250 } };

      await scannerRef.current.start(
        { facingMode: "environment" },
        qrConfig,
        (decodedText) => {
          console.log("✅ QR DETECTED:", decodedText);
          if (onScanRef.current) onScanRef.current(decodedText);
        }
      );
      
      setScanning(true);
      setError(null);
    } catch (err) {
      console.error("Scanner start error:", err);
      // Only set error if it's not a transition error we already handle
      if (!err.toString().includes("already under transition")) {
        setError(err.toString());
      }
      setScanning(false);
    } finally {
      isTransitioning.current = false;
    }
  };

  const stopScanner = async () => {
    if (isTransitioning.current) return;
    
    if (scannerRef.current && scannerRef.current.isScanning) {
      isTransitioning.current = true;
      try {
        await scannerRef.current.stop();
        setScanning(false);
      } catch (err) {
        console.error("Stop error:", err);
      } finally {
        isTransitioning.current = false;
      }
    }
  };

  const handleFileScan = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setScanning(true); // Show a busy state
    setError(null);

    try {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode("reader");
      }

      // If camera is running, stop it first to prevent collisions
      if (scannerRef.current.isScanning) {
        try {
          await scannerRef.current.stop();
        } catch (stopErr) {
          console.warn("Minor stop error during file scan transition:", stopErr);
        }
      }

      console.log("📁 Processing file scan...");
      const decodedText = await scannerRef.current.scanFile(file, true);
      
      console.log("✅ FILE QR DETECTED (Success):", decodedText);
      
      // Clear the reader div which now contains the image preview
      try {
        await scannerRef.current.clear();
      } catch (clearErr) {
        console.warn("Clear error:", clearErr);
      }

      if (onScanRef.current) onScanRef.current(decodedText);
      
      setScanning(false);
    } catch (err) {
      console.error("File scan error:", err);
      setError("Could not find a valid QR code in that image. Try a clearer photo.");
      setScanning(false);
    }
  };

  useEffect(() => {
    startScanner();
    return () => {
      stopScanner();
    };
  }, []);

  return (
    <div className="scanner-container" style={{ position: "relative" }}>
      <div id="reader" style={{ width: "100%", borderRadius: "12px", overflow: "hidden" }} />
      
      {error && (
        <div style={{ color: "var(--danger)", padding: "10px", textAlign: "center", fontSize: "0.9rem" }}>
          ⚠️ {error}
          <div style={{ marginTop: "10px" }}>
             <button className="btn btn-primary" onClick={startScanner}>Retry Camera 🔄</button>
          </div>
        </div>
      )}

      {!scanning && !error && (
        <div style={{ textAlign: "center", padding: "20px" }}>
          <button className="btn btn-primary" onClick={startScanner}>Start Camera 📷</button>
        </div>
      )}

      <div style={{ 
        textAlign: "center", 
        padding: "10px", 
        borderTop: "1px solid #eee", 
        marginTop: "10px",
        background: "#f9fafb",
        borderBottomLeftRadius: "12px",
        borderBottomRightRadius: "12px"
      }}>
        <label style={{ 
          cursor: "pointer", 
          color: "var(--primary)", 
          fontWeight: 500,
          display: "inline-flex",
          alignItems: "center",
          gap: "5px"
        }}>
          <span>📁 Scan from Image / File</span>
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleFileScan} 
            style={{ display: "none" }} 
          />
        </label>
      </div>
    </div>
  );
}