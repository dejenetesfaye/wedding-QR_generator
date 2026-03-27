import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import API from "./config";

export default function TicketView() {
  const { id } = useParams();
  const [guest, setGuest] = useState(null);
  const [error, setError] = useState("");

  const fetchGuest = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/api/invite/${id}`);
      setGuest(res.data);

    } catch (err) {
      setError("Invalid Invitation ❌");
    }
  }, [id]);

  useEffect(() => {
    fetchGuest();
  }, [fetchGuest]);


  if (error) {
    return (
      <div className="app-container" style={{textAlign: "center", paddingTop: "5rem"}}>
        <h1 style={{color: "var(--danger)"}}>{error}</h1>
      </div>
    );
  }

  if (!guest) {
    return <div className="app-container" style={{textAlign: "center"}}>Loading...</div>;
  }

  return (
    <div className="app-container" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '80vh',
      textAlign: 'center'
    }}>
      <div className="card" style={{
        width: '100%', 
        maxWidth: '400px', 
        padding: '3rem 2rem', 
        borderTop: '6px solid var(--primary-color)'
      }}>
        <img src="/logo.jpg" alt="Wedding Logo" style={{ width: '130px', height: '130px', borderRadius: '50%', marginBottom: '1.5rem', objectFit: 'cover', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
        <h1 style={{marginBottom: '0.5rem', fontSize: '2rem', color: 'var(--primary-color)'}}>{guest.name}</h1>
        <p style={{color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '1.1rem'}}>You are officially invited!</p>
        
        <div style={{
          background: 'var(--bg-color)', 
          padding: '1.5rem', 
          borderRadius: '12px',
          marginBottom: '1rem'
        }}>
          <h3 style={{margin: '0 0 0.5rem 0', color: 'var(--text-muted)', fontSize: '0.875rem', textTransform: 'uppercase'}}>Entry Status</h3>
          <span className={guest.checkedIn ? "badge badge-warning" : "badge badge-success"} style={{fontSize: '1.1rem', padding: '0.6rem 1rem'}}>
            {guest.checkedIn ? "Already Checked In ⚠️" : "Valid Ticket ✅"}
          </span>
        </div>
        
        <p style={{fontSize: '0.875rem', color: '#9ca3af', marginTop: '2rem', lineHeight: '1.5'}}>
          Please present this digital ticket screen or your physical QR code at the entrance to be welcomed in.
        </p>
      </div>
    </div>
  );
}
