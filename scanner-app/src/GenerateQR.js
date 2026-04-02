import { useState } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import API from "./config";

export default function GenerateQR() {
  const { eventId } = useParams();
  
  // State for dynamic table rows
  const [guests, setGuests] = useState([{ name: "", phone: "" }, { name: "", phone: "" }, { name: "", phone: "" }]);
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [canDownload, setCanDownload] = useState(true);

  // Handle changing table inputs
  const handleInputChange = (index, field, value) => {
    const updatedGuests = [...guests];
    updatedGuests[index][field] = value;
    setGuests(updatedGuests);
    setMessage("");
    setError("");
  };

  const handleAddRow = () => {
    setGuests([...guests, { name: "", phone: "" }]);
  };

  const handleAddFiveRows = () => {
    const newRows = Array.from({ length: 5 }, () => ({ name: "", phone: "" }));
    setGuests([...guests, ...newRows]);
  };

  const handleRemoveRow = (index) => {
    const updatedGuests = guests.filter((_, i) => i !== index);
    setGuests(updatedGuests);
  };

  const handleGenerate = async () => {
    // Filter out rows with empty names before submitting
    const validGuests = guests.filter(g => g.name.trim() !== "");
    
    if (validGuests.length === 0) {
      setError("Please add at least one guest name.");
      return;
    }

    setLoading(true);
    setMessage("");
    setError("");

    try {
      console.log(`Sending ${validGuests.length} guests to backend for Event ${eventId}...`);
      const res = await axios.post(`${API}/api/invite/generate`, {
        eventId,
        guests: validGuests,
      });

      console.log("Generate response:", res.data);
      setMessage(res.data.message);
      
      // Optionally keep or clear valid guests. We'll clear the table to indicate success.
      setGuests([{ name: "", phone: "" }, { name: "", phone: "" }]);
      setCanDownload(true);
    } catch (err) {
      console.error("Generate error:", err);
      setError(err.response?.data?.message || err.message || "Error generating QR codes");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <div className="top-bar">
        <h1 className="title" style={{ margin: 0 }}>Generate QR Codes 🖨️</h1>
        <div style={{ display: "flex", gap: "10px" }}>
          <a
            href={canDownload ? `${API}/api/download/qrcodes.pdf` : "#"}
            className={`btn btn-success ${!canDownload ? "disabled" : ""}`}
            style={{ 
              opacity: canDownload ? 1 : 0.5, 
              pointerEvents: canDownload ? "auto" : "none",
              cursor: canDownload ? "pointer" : "not-allowed"
            }}
            onClick={(e) => !canDownload && e.preventDefault()}
          >
            Download PDF ⬇️
          </a>
          <Link to={`/dashboard/${eventId}`} className="btn btn-primary" style={{ background: "var(--text-muted)" }}>
            ← Dashboard
          </Link>
        </div>
      </div>

      <div className="card">
        <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem" }}>
          Enter guest names and phone numbers below to generate their unique invitations. Blank rows will be ignored.
        </p>

        <div className="table-container" style={{ marginBottom: "1.5rem", overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ width: "50px", textAlign: "center" }}>#</th>
                <th>Guest Name *</th>
                <th>Phone Number</th>
                <th style={{ width: "80px", textAlign: "center" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {guests.map((g, i) => (
                <tr key={i}>
                  <td style={{ textAlign: "center", color: "var(--text-muted)" }}>{i + 1}</td>
                  <td>
                    <input 
                      type="text"
                      className="search-input"
                      placeholder="e.g. John Doe"
                      value={g.name}
                      onChange={(e) => handleInputChange(i, "name", e.target.value)}
                      style={{ width: "100%", padding: "0.5rem" }}
                    />
                  </td>
                  <td>
                    <input 
                      type="tel"
                      className="search-input"
                      placeholder="e.g. 0911223344"
                      value={g.phone}
                      onChange={(e) => handleInputChange(i, "phone", e.target.value)}
                      style={{ width: "100%", padding: "0.5rem" }}
                    />
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <button 
                      onClick={() => handleRemoveRow(i)}
                      className="btn"
                      style={{ background: "#fee2e2", color: "#991b1b", padding: "0.5rem", fontSize: "0.8rem" }}
                      title="Remove Row"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ display: "flex", gap: "10px", marginBottom: "2rem" }}>
          <button onClick={handleAddRow} className="btn" style={{ background: "rgba(255,255,255,0.05)", border: "1px dashed var(--gold)" }}>
            ➕ Add Row
          </button>
          <button onClick={handleAddFiveRows} className="btn" style={{ background: "rgba(255,255,255,0.05)", border: "1px dashed #10b981", color: "#10b981" }}>
            ➕ Add 5 Rows
          </button>
        </div>

        <button
          className="btn btn-success"
          onClick={handleGenerate}
          disabled={loading || guests.filter(g => g.name.trim() !== "").length === 0}
          style={{ padding: "1rem 2rem", fontSize: "1rem", width: "100%" }}
        >
          {loading
            ? "Generating PDF... ⏳"
            : `Generate QR Codes & Update PDF`}
        </button>

        {message && (
          <div style={{ marginTop: "1.5rem", padding: "1rem", background: "#d1fae5", color: "#065f46", borderRadius: "8px", fontWeight: 500 }}>
            {message}
          </div>
        )}

        {error && (
          <div style={{ marginTop: "1.5rem", padding: "1rem", background: "#fee2e2", color: "#991b1b", borderRadius: "8px", fontWeight: 500 }}>
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
