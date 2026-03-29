import { useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import API from "./config";
import { downloadGuestQR } from "./utils/qrHelper";

export default function GuestPortal() {
  const { eventId } = useParams();
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [guestData, setGuestData] = useState(null);
  const [error, setError] = useState("");

  const handleLookup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setGuestData(null);

    try {
      // Use eventId if present, otherwise use universal lookup
      const url = eventId 
        ? `${API}/api/invite/lookup/${eventId}/${phone}` 
        : `${API}/api/invite/lookup-universal?phone=${encodeURIComponent(phone)}`;
      
      const res = await axios.get(url);
      setGuestData(res.data);
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
      <div className="card" style={{ width: "100%", maxWidth: "450px", textAlign: "center", padding: "3rem 2rem" }}>
        <h1 className="title" style={{ fontSize: "2rem", marginBottom: "1rem" }}>Welcome 🥂</h1>
        <p style={{ color: "var(--text-muted)", marginBottom: "2rem" }}>
          Enter your phone number to retrieve your personalized wedding invitation.
        </p>

        {!guestData ? (
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
        ) : (
          <div className="checkin-success" style={{ background: "transparent", border: "none", animation: "fadeIn 0.5s ease" }}>
            <h2 style={{ color: "var(--gold)", margin: "0 0 0.5rem 0" }}>Found You! ✅</h2>
            <p style={{ color: "var(--text-main)", fontSize: "1.5rem", fontWeight: 700, margin: "0 0 2rem 0" }}>
              {guestData.guest.name}
            </p>
            <button 
              onClick={handleDownload} 
              className="btn btn-primary" 
              style={{ width: "100%", padding: "1.2rem", fontSize: "1.1rem" }}
            >
              Download My Ticket 📥
            </button>
          </div>

        )}
      </div>
    </div>
  );
}
