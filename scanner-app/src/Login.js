import { useState, useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const success = await login(username, password);
    if (success) {
      navigate("/events"); // Managers skip to their events
    } else {
      setError("Invalid username or password ❌");
      setLoading(false);
    }
  };

  return (
    <div className="app-container" style={{ justifyContent: "center", display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <div className="card">
        <h1 className="title" style={{ textAlign: "center", marginBottom: "2rem" }}>Manager Login 💍</h1>
        
        {error && (
          <div style={{ background: "#fee2e2", color: "#991b1b", padding: "1rem", borderRadius: "8px", marginBottom: "1rem", textAlign: "center" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-muted)", fontWeight: 500 }}>Username</label>
            <input
              type="text"
              className="search-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g., admin"
              required
            />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-muted)", fontWeight: 500 }}>Password</label>
            <input
              type="password"
              className="search-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ padding: "1rem", marginTop: "1rem", fontSize: "1rem", width: "100%" }}>
            {loading ? "Logging in... ⏳" : "Login 🔑"}
          </button>
        </form>
      </div>
    </div>
  );
}
