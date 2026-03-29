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



import GuestPortal from "./GuestPortal";

function Home() {
  const { eventId } = useParams();
  const [guest, setGuest] = useState(null);

  const [lastScan, setLastScan] = useState(0);

  const handleScan = async (scannedText) => {
    const now = Date.now();
    if (now - lastScan < 2000) return;
    setLastScan(now);

    try {
      let id = "";
      if (scannedText.includes("#ID:")) {
        id = scannedText.split("#ID:").pop().trim();
      } else if (scannedText.includes("ID:")) {
        id = scannedText.split("ID:").pop().trim();
      } else if (scannedText.includes("/")) {
        id = scannedText.split('/').pop().trim();
      } else {
        id = scannedText.trim();
      }


      const res = await axios.get(`${API}/api/invite/guest/${id}`);
      const scannedGuest = res.data;

      if (!scannedGuest.checkedIn) {
        const checkInRes = await axios.post(`${API}/api/invite/${scannedGuest.id}/checkin`);
        setGuest(checkInRes.data.guest);
      } else {
        setGuest(scannedGuest);
      }

    } catch (err) {
      console.error("Scan error:", err);
      setGuest({ error: "Invalid QR ❌" });
    }
  };

  return (
    <div className="app-container" style={{padding: 0}}>
      {guest ? (
        <ResultCard data={guest} />
      ) : (
        <>
          <div className="top-bar" style={{padding: '1rem'}}>
            <h2 className="title" style={{margin: 0, fontSize: '1.5rem'}}>Gate Scanner 💍</h2>
            <Link to={`/dashboard/${eventId}`} className="btn btn-primary" style={{padding: '0.5rem 1rem'}}>
              Exit 📊
            </Link>
          </div>
          <Scanner onScan={handleScan} />
        </>
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
        <Route path="/guest-access/:eventId" element={<GuestPortal />} />
        <Route path="/invitation" element={<GuestPortal />} />


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