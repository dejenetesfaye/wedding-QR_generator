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
    const now = Date.now();
    if (now - lastScan < 2000) return;
    setLastScan(now);

    try {
      console.log("Processing Scan:", scannedText);
      
      let id = "";
      if (scannedText.includes("ID:")) {
        id = scannedText.split("ID:").pop().trim();
      } else if (scannedText.includes("/")) {
        id = scannedText.split('/').pop().trim();
      } else {
        id = scannedText.trim();
      }

      console.log("Extracted ID:", id);

      // 1. Fetch guest details
      const res = await axios.get(`${API}/api/invite/guest/${id}`);
      const scannedGuest = res.data;

      // 2. AUTO-CHECK-IN if not already checked in
      if (!scannedGuest.checkedIn) {
        console.log("🎟️ Auto-Checking-In guest:", scannedGuest.name);
        const checkInRes = await axios.post(`${API}/api/invite/${scannedGuest.id}/checkin`);
        setGuest(checkInRes.data.guest); // Show updated guest with check-in timestamp
      } else {
        console.log("ℹ️ Guest already checked in:", scannedGuest.name);
        setGuest(scannedGuest); // Still show the card to let scanner know they are valid but already in
      }

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