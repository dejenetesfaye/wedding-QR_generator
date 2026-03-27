import { useState, useEffect, useContext, useCallback } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";
import API from "./config";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [creating, setCreating] = useState(false);

  const { user } = useContext(AuthContext);


  const fetchUsers = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API}/api/auth/users`);
      if (Array.isArray(data)) {
        setUsers(data);
      } else {
        console.error("Data is not an array:", data);
      }
    } catch (err) {
      console.error("Error fetching users", err);
    } finally {
      setLoading(false);
    }
  }, [API]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await axios.post(`${API}/api/auth/register`, {
        name,
        username,
        password,
        role: "MANAGER" // Force new users to be managers
      });
      setName("");
      setUsername("");
      setPassword("");
      setShowForm(false);
      fetchUsers(); // Refresh list
    } catch (err) {
      console.error("Error creating user", err);
      alert(err.response?.data?.message || "Failed to create manager.");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteUser = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete manager "${name}"?`)) return;
    try {
      console.log(`Deleting user ${id}...`);
      const res = await axios.delete(`${API}/api/auth/users/${id}`);
      console.log("Delete response:", res.data);
      fetchUsers();
    } catch (err) {
      console.error("Error deleting user", err);
      alert(err.response?.data?.message || "Failed to delete user.");
    }
  };

  if (loading) return <div className="app-container" style={{textAlign:"center", marginTop:"50px"}}>Loading Users...</div>;

  return (
    <div className="app-container" style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <div className="top-bar">
        <h1 className="title" style={{ margin: 0 }}>Manage Managers 👥</h1>
        <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
          <Link to="/events" className="btn btn-secondary">
            Back ⬅️
          </Link>
          <button onClick={() => setShowForm(!showForm)} className="btn btn-success">
            {showForm ? "Cancel ❌" : "Create Manager ➕"}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="card" style={{ marginTop: "1rem", border: "2px dashed #10b981" }}>
          <h2 style={{ marginTop: 0 }}>Create New Manager Account</h2>
          <form onSubmit={handleCreateUser} style={{ display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "flex-end" }}>
            <div style={{ flex: 1, minWidth: "150px" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem" }}>Full Name</label>
              <input required className="search-input" placeholder="e.g. Jane Doe" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div style={{ flex: 1, minWidth: "150px" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem" }}>Login Username</label>
              <input required className="search-input" placeholder="e.g. jane_manager" value={username} onChange={e => setUsername(e.target.value)} />
            </div>
            <div style={{ flex: 1, minWidth: "150px" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem" }}>Password</label>
              <input required type="password" className="search-input" placeholder="Enter password" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-primary" disabled={creating} style={{ height: "42px" }}>
              {creating ? "Saving..." : "Create Account ✅"}
            </button>
          </form>
        </div>
      )}

      <div style={{ display: "grid", gap: "1rem", marginTop: "1rem" }}>
        {users.length === 0 ? (
          <div className="card" style={{ textAlign: "center", color: "var(--text-muted)" }}>
            No users found.
          </div>
        ) : (
          users.map((u) => (
            <div key={u._id} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3 style={{ margin: "0 0 0.5rem 0", color: "#1f2937" }}>{u.name} <span style={{fontSize: "0.75rem", background: "#f3f4f6", padding: "2px 6px", borderRadius: "10px"}}>{u.role}</span></h3>
                <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--text-muted)" }}>
                  Username: {u.username}
                </p>
              </div>
              {u._id !== user._id && (
                <button 
                  onClick={() => handleDeleteUser(u._id, u.name)} 
                  className="btn" 
                  style={{ background: "#fee2e2", color: "#991b1b" }}
                >
                  Delete 🗑️
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
