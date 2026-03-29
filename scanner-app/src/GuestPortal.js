import { useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import API from "./config";
import { downloadGuestQR, generateLuxuryQRCanvas } from "./utils/qrHelper";

export default function GuestPortal() {
  const { eventId } = useParams();
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [guestData, setGuestData] = useState(null);
  const [qrImage, setQrImage] = useState("");
  const [error, setError] = useState("");

  const handleLookup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setGuestData(null);
    setQrImage("");

    try {
      // Use eventId if present, otherwise use universal lookup
      const url = eventId 
        ? `${API}/api/invite/lookup/${eventId}/${phone}` 
        : `${API}/api/invite/lookup-universal?phone=${encodeURIComponent(phone)}`;
      
      const res = await axios.get(url);
      setGuestData(res.data);
      
      // Generate the on-screen preview immediately
      const canvas = await generateLuxuryQRCanvas(res.data.guest, res.data.eventInfo.qrCustomText);
      if (canvas) {
        setQrImage(canvas.toDataURL("image/png"));
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please check your phone number.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!guestData) return;
    // We pass the event info so the helper can use the custom wording
    downloadGuestQR(guestData.guest, guestData.eventInfo.qrCustomText);
  };

  return (
    <div className="app-container" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="card" style={{ width: "100%", maxWidth: "500px", textAlign: "center", padding: "2rem 1.5rem" }}>
        <h1 className="title" style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>Welcome 🥂</h1>
        
        {!guestData ? (
          <>
            <p style={{ color: "var(--text-muted)", marginBottom: "2rem" }}>
              Enter your phone number to retrieve your personalized wedding invitation.
            </p>
            <form onSubmit={handleLookup}>
              <input 
                required
                type="tel"
                className="search-input"
                placeholder="e.g. +251..."
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{ textAlign: "center", fontSize: "1.2rem", padding: "1.2rem" }}
              />
              {error && <p style={{ color: "var(--danger)", marginBottom: "1.5rem" }}>{error}</p>}
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={loading} 
                style={{ width: "100%", padding: "1.2rem", fontSize: "1.1rem" }}
              >
                {loading ? "Searching..." : "Get My Invitation 🎫"}
              </button>
            </form>
          </>
        ) : (
          <div className="checkin-success" style={{ background: "transparent", border: "none", animation: "fadeIn 0.5s ease", padding: 0 }}>
            <button 
              onClick={handleDownload} 
              className="btn btn-primary" 
              style={{ width: "100%", padding: "1.2rem", fontSize: "1.1rem", marginBottom: "1.5rem" }}
            >
              Download My Ticket 📥
            </button>

            {qrImage && (
              <div style={{ position: 'relative', marginTop: '1rem' }}>
                <img 
                  src={qrImage} 
                  alt="Wedding Invitation" 
                  style={{ width: "100%", borderRadius: "12px", boxShadow: "0 10px 30px rgba(0,0,0,0.5)", border: '2px solid var(--gold)' }} 
                />
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}

