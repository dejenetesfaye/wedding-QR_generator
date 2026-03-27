import { useState } from "react";
import axios from "axios";
import Scanner from "./Scanner";
import Dashboard from "./Dashboard";
import ResultCard from "./ResultCard";
import TicketView from "./TicketView";
import GenerateQR from "./GenerateQR";
import Login from "./Login";
import EventSelection from "./EventSelection";
import UserManagement from "./UserManagement";
import ProtectedRoute from "./ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import { Routes, Route, Link, useParams, Navigate } from "react-router-dom";
import API from "./config";



function Home() {
  const { eventId } = useParams();
  const [guest, setGuest] = useState(null);

  const [lastScan, setLastScan] = useState(0);

  const handleScan = async (scannedText) => {
    // Debounce: Ignore scans that happen within 2 seconds of each other
    // This stops flickering/screen noise from causing "Invalid QR"
    const now = Date.now();
    if (now - lastScan < 2000) return;
    setLastScan(now);

    try {
      console.log("Processing Scan:", scannedText);
      
      let id = "";
      // 1. Check if it's the old "ID:uuid" format
      if (scannedText.includes("ID:")) {
        id = scannedText.split("ID:").pop().trim();
      } 
      // 2. Split by slash (legacy URL format)
      else if (scannedText.includes("/")) {
        id = scannedText.split('/').pop().trim();
      }
      // 3. Otherwise assume it's the new raw ID format
      else {
        id = scannedText.trim();
      }

      console.log("Extracted ID:", id);

      const res = await axios.get(
        `${API}/api/invite/guest/${id}`
      );


      setGuest(res.data);
    } catch (err) {
      console.error("Scan error:", err);
      setGuest({ error: "Invalid QR ❌ (Try holding still or scanning from further away)" });
    }
  };

  const handleCheckIn = async () => {
    try {
      const res = await axios.post(
        `${API}/api/invite/${guest.id}/checkin`
      );


      setGuest(res.data.guest);
    } catch {
      alert("Error checking in");
    }
  };

  return (
    <div className="app-container">
      <div className="top-bar">
        <h1 className="title" style={{margin: 0}}>Scanner 🎉</h1>
        
        <Link to={`/dashboard/${eventId}`} className="btn btn-primary">
          Dashboard 📊
        </Link>
      </div>

      <Scanner onScan={handleScan} />

      {guest?.error ? (
        <div className="result-card" style={{borderTopColor: '#ef4444'}}>
          <h2 style={{color: '#ef4444', marginBottom: 0}}>{guest.error}</h2>
        </div>
      ) : (
        <ResultCard data={guest} onCheckIn={handleCheckIn} />
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/events" replace />} />
        <Route path="/login" element={<Login />} />
        
        {/* Scanners can scan without login if they have the specific event link. */}
        <Route path="/scan/:eventId" element={<Home />} />
        <Route path="/ticket/:id" element={<TicketView />} />

        {/* Protected Manager Routes */}
        <Route path="/events" element={<ProtectedRoute><EventSelection /></ProtectedRoute>} />
        <Route path="/users" element={<ProtectedRoute><UserManagement /></ProtectedRoute>} />
        <Route path="/dashboard/:eventId" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/generate/:eventId" element={<ProtectedRoute><GenerateQR /></ProtectedRoute>} />
      </Routes>
    </AuthProvider>
  );
}

export default App;