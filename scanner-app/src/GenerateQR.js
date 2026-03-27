import { useState } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import API from "./config";

function parseCSVInput(raw) {

  const lines = raw.split("\n").map(l => l.trim()).filter(Boolean);
  const guests = [];
  const errors = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Skip header row if it starts with "name"
    if (i === 0 && line.toLowerCase().startsWith("name")) continue;

    const parts = line.split(",");
    const name = (parts[0] || "").trim();
    const phone = (parts[1] || "").trim();

    if (!name) {
      errors.push(`Line ${i + 1}: Missing name`);
      continue;
    }

    guests.push({ name, phone });
  }

  return { guests, errors };
}

const PLACEHOLDER = `Abebe Kebede,0911111111
Selam Tesfaye,0922222222
John Doe,0933333333`;

export default function GenerateQR() {
  const { eventId } = useParams();
  const [rawText, setRawText] = useState("");
  const [preview, setPreview] = useState(null);
  const [parseErrors, setParseErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [canDownload, setCanDownload] = useState(true);

  const handleParse = () => {
    const { guests, errors } = parseCSVInput(rawText);
    setPreview(guests);
    setParseErrors(errors);
    setMessage("");
    setError("");
  };

  const handleGenerate = async () => {
    if (!preview || preview.length === 0) return;

    setLoading(true);
    setMessage("");
    setError("");

    try {
      console.log(`Sending ${preview.length} guests to backend for Event ${eventId}...`);
      const res = await axios.post(`${API}/invite/generate`, {
        eventId,
        guests: preview,
      });
      console.log("Generate response:", res.data);
      setMessage(res.data.message);
      setPreview(null);
      setRawText("");
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
            href={canDownload ? `${API}/download/qrcodes.pdf` : "#"}
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
        <p style={{ color: "var(--text-muted)", marginBottom: "0.5rem" }}>
          Paste guest names and phone numbers, one per line, in <code>name,phone</code> format:
        </p>

        <div style={{
          background: "#f3f4f6",
          border: "1px solid #d1d5db",
          borderRadius: "8px",
          padding: "0.75rem 1rem",
          marginBottom: "1rem",
          fontSize: "0.875rem",
          fontFamily: "monospace",
          color: "#374151"
        }}>
          Abebe Kebede,0911111111<br />
          Selam Tesfaye,0922222222<br />
          John Doe,0933333333
        </div>

        <textarea
          rows={10}
          className="search-input"
          value={rawText}
          onChange={e => { setRawText(e.target.value); setPreview(null); }}
          placeholder={PLACEHOLDER}
          style={{
            marginBottom: "1rem",
            fontFamily: "monospace",
            fontSize: "0.95rem",
            resize: "vertical",
            lineHeight: "1.7"
          }}
        />

        {parseErrors.length > 0 && (
          <div style={{ marginBottom: "1rem", color: "var(--danger)", fontSize: "0.875rem" }}>
            {parseErrors.map((e, i) => <div key={i}>⚠️ {e}</div>)}
          </div>
        )}

        <button
          className="btn btn-primary"
          onClick={handleParse}
          disabled={!rawText.trim()}
          style={{ marginRight: "1rem", padding: "0.75rem 1.5rem" }}
        >
          Preview Guests 👁️
        </button>

        {preview && preview.length > 0 && (
          <>
            <div className="table-container" style={{ marginTop: "2rem", marginBottom: "1.5rem" }}>
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Phone</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.map((g, i) => (
                    <tr key={i}>
                      <td style={{ color: "var(--text-muted)" }}>{i + 1}</td>
                      <td style={{ fontWeight: 500 }}>{g.name}</td>
                      <td style={{ color: "var(--text-muted)" }}>{g.phone || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              className="btn btn-success"
              onClick={handleGenerate}
              disabled={loading}
              style={{ padding: "1rem 2rem", fontSize: "1rem", width: "100%" }}
            >
              {loading
                ? "Generating PDF... ⏳"
                : `Generate ${preview.length} QR Code${preview.length > 1 ? "s" : ""} & Update PDF`}
            </button>
          </>
        )}

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
