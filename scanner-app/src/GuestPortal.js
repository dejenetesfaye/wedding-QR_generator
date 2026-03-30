import { useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import API from "./config";
import { downloadGuestQR, generateLuxuryQRCanvas } from "./utils/qrHelper";

export default function GuestPortal() {
  const { eventId, slug } = useParams();
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [qrMatches, setQrMatches] = useState([]);
  const [loadingAll, setLoadingAll] = useState(false);
  const [error, setError] = useState("");
  const [eventDetails, setEventDetails] = useState(null);
  const [pageError, setPageError] = useState("");

  // Fetch event details on load if accessing via unique link (slug)
  useEffect(() => {
    if (slug) {
      axios.get(`${API}/api/events/slug/${slug}`)
        .then(res => setEventDetails(res.data))
        .catch(err => {
          console.error("Event lookup failed", err);
          setPageError("This wedding invitation link is invalid or has been removed. ❌");
        });
    }
  }, [slug]);

  const handleLookup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setQrMatches([]);

    try {
      const activeEventId = eventDetails?._id || eventId;
      
      const url = activeEventId 
        ? `${API}/api/invite/lookup/${activeEventId}/${phone}` 
        : `${API}/api/invite/lookup-universal?phone=${encodeURIComponent(phone)}`;
      
      const res = await axios.get(url);
      const foundMatches = Array.isArray(res.data) ? res.data : [res.data];

      setLoadingAll(true);
      const generated = await Promise.all(foundMatches.map(async (m) => {
        const canvas = await generateLuxuryQRCanvas(m.guest, m.eventInfo.qrCustomText);
        return {
          ...m,
          image: canvas ? canvas.toDataURL("image/png") : ""
        };
      }));
      setQrMatches(generated);

    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please check your phone number.");
    } finally {
      setLoading(false);
      setLoadingAll(false);
    }
  };

  const handleDownload = (match) => {
    downloadGuestQR(match.guest, match.eventInfo.qrCustomText);
  };


  return (
    <div className="app-container" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="card" style={{ width: "100%", maxWidth: "500px", textAlign: "center", padding: "2rem 1.5rem" }}>
        <h1 className="title" style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>
          {eventDetails ? `Welcome to ${eventDetails.name} 🥂` : "Welcome 🥂"}
        </h1>
        
        {pageError ? (
          <div style={{ padding: "2rem 0" }}>
            <p style={{ color: "var(--danger)", marginBottom: "2rem", fontSize: "1.2rem" }}>{pageError}</p>
          </div>
        ) : qrMatches.length === 0 ? (
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
                style={{ textAlign: "center", fontSize: "1.2rem", padding: "1.2rem", width: "100%", marginBottom: "1rem" }}
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
          <div style={{ animation: "fadeIn 0.5s ease" }}>
            {qrMatches.length > 1 && (
              <p style={{ color: "var(--gold)", fontWeight: "bold", marginBottom: "1.5rem" }}>
                We found {qrMatches.length} invitations for you! ✨
              </p>
            )}
            
            <div style={{ display: "grid", gap: "2rem", maxHeight: "70vh", overflowY: "auto", padding: "10px" }}>
              {qrMatches.map((match, idx) => (
                <div key={idx} className="qr-card-container" style={{ textAlign: "center" }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ color: 'var(--gold-light)', fontWeight: 'bold' }}>{match.eventInfo.name}</span>
                    <button 
                      onClick={() => handleDownload(match)} 
                      className="btn btn-primary" 
                      style={{ padding: "0.5rem 1rem", fontSize: "0.9rem" }}
                    >
                      Download 📥
                    </button>
                  </div>
                  <img 
                    src={match.image} 
                    alt={`Invitation for ${match.eventInfo.name}`} 
                    style={{ width: "100%", borderRadius: "12px", boxShadow: "0 10px 30px rgba(0,0,0,0.5)", border: '2px solid var(--gold)' }} 
                  />
                </div>
              ))}
            </div>

            <button 
              onClick={() => { setQrMatches([]); setPhone(""); }} 
              className="btn btn-secondary" 
              style={{ marginTop: "2rem", width: "100%", background: "transparent", border: "1px solid var(--text-muted)", color: "var(--text-muted)" }}
            >
              Search Another Number 🔍
            </button>
          </div>
        )}
      </div>
    </div>
  );
}



