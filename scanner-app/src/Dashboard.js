import { useEffect, useState, useCallback } from "react";

import axios from "axios";
import GuestTable from "./GuestTable";
import { useParams, Link } from "react-router-dom";
import API from "./config";


export default function Dashboard() {
  const { eventId } = useParams();
  const [guests, setGuests] = useState([]);
  const [stats, setStats] = useState({ total: 0, checkedIn: 0, remaining: 0 });
  const [search, setSearch] = useState("");
 
  const fetchData = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/api/invite/${eventId}`);
      setGuests(res.data);

      const statRes = await axios.get(`${API}/api/invite/${eventId}/stats`);
      setStats(statRes.data);

    } catch (e) {
      console.error(e);
    }
  }, [eventId]);


  useEffect(() => {
    fetchData();

    // auto refresh every 5 seconds
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [fetchData]);


  const filteredGuests = guests.filter(g =>
    g.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="app-container">
      <div className="top-bar">
        <h1 className="title" style={{margin: 0}}>Admin Dashboard 📊</h1>
        <div style={{display: 'flex', gap: '10px'}}>
          <Link to="/events" className="btn btn-secondary">
            Back ⬅️
          </Link>
          <Link to={`/generate/${eventId}`} className="btn btn-success">
            Gen QR 🖨️
          </Link>
          <Link to={`/scan/${eventId}`} className="btn btn-primary">
            Scanner 📷
          </Link>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.total || 0}</div>
          <div className="stat-label">Total Guests</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{color: '#10b981'}}>{stats.checkedIn || 0}</div>
          <div className="stat-label">Checked In</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{color: '#f59e0b'}}>{stats.remaining || 0}</div>
          <div className="stat-label">Remaining</div>
        </div>
      </div>

      <input
        className="search-input"
        placeholder="Search guest by name..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <GuestTable guests={filteredGuests} />
    </div>
  );
}