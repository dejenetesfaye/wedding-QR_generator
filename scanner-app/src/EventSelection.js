import { useState, useEffect, useContext, useCallback } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";
import API from "./config";

export default function EventSelection() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [creating, setCreating] = useState(false);
  const { user, logout } = useContext(AuthContext);


  const fetchEvents = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API}/api/events`);
      setEvents(data);
    } catch (err) {
      console.error("Error fetching events", err);
    } finally {
      setLoading(false);
    }
  }, []);


  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await axios.post(`${API}/api/events`, {
        name: eventName,
        date: eventDate,
        description: ""
      });
      setEventName("");
      setEventDate("");
      setShowForm(false);
      fetchEvents(); // Refresh list
    } catch (err) {
      console.error("Error creating event", err);
      alert("Failed to create wedding.");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteEvent = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"? This will also delete ALL guests for this wedding.`)) return;
    try {
      console.log(`Deleting event ${id}...`);
      const res = await axios.delete(`${API}/api/events/${id}`);
      console.log("Delete response:", res.data);
      fetchEvents();
    } catch (err) {
      console.error("Error deleting event", err);
      alert("Failed to delete wedding.");
    }
  };

  if (loading) return <div className="app-container" style={{textAlign:"center", marginTop:"50px"}}>Loading Events...</div>;

  return (
    <div className="app-container" style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <div className="top-bar">
        <h1 className="title" style={{ margin: 0 }}>My Weddings 💍</h1>
        <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
          <button onClick={() => setShowForm(!showForm)} className="btn btn-success">
            {showForm ? "Cancel ❌" : "Create Wedding ➕"}
          </button>
          {user?.role === "ADMIN" && (
            <Link to="/users" className="btn btn-primary">
              Managers 👥
            </Link>
          )}
          <span style={{ fontWeight: 500, color: "var(--text-muted)" }}>{user?.name}</span>
          <button onClick={logout} className="btn" style={{ background: "#fee2e2", color: "#991b1b" }}>Logout</button>
        </div>
      </div>

      {showForm && (
        <div className="card" style={{ marginTop: "1rem", border: "2px dashed #10b981" }}>
          <h2 style={{ marginTop: 0 }}>Create New Wedding</h2>
          <form onSubmit={handleCreateEvent} style={{ display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "flex-end" }}>
            <div style={{ flex: 1, minWidth: "200px" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem" }}>Wedding Name</label>
              <input 
                required 
                className="search-input" 
                placeholder="e.g. John & Jane Wedding" 
                value={eventName}
                onChange={e => setEventName(e.target.value)}
              />
            </div>
            <div style={{ flex: 1, minWidth: "150px" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem" }}>Date</label>
              <input 
                required 
                type="date" 
                className="search-input" 
                value={eventDate}
                onChange={e => setEventDate(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={creating} style={{ height: "42px" }}>
              {creating ? "Saving..." : "Save Wedding ✅"}
            </button>
          </form>
        </div>
      )}

      <div style={{ display: "grid", gap: "1rem", marginTop: "1rem" }}>
        {events.length === 0 ? (
          <div className="card" style={{ textAlign: "center", color: "var(--text-muted)" }}>
            No weddings assigned to you yet.
          </div>
        ) : (
          events.map((evt) => (
            <div key={evt._id} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3 style={{ margin: "0 0 0.5rem 0", color: "#1f2937" }}>{evt.name}</h3>
                <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--text-muted)" }}>
                  {new Date(evt.date).toLocaleDateString()}
                </p>
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <Link to={`/dashboard/${evt._id}`} className="btn btn-primary">
                  Manage 📊
                </Link>
                <Link to={`/scan/${evt._id}`} className="btn btn-success">
                  Scan 📷
                </Link>
                <button 
                  onClick={() => handleDeleteEvent(evt._id, evt.name)} 
                  className="btn" 
                  style={{ background: "#fee2e2", color: "#991b1b" }}
                >
                  Delete 🗑️
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
