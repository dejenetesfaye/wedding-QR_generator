import axios from "axios";
import API from "./config";
import { downloadGuestQR } from "./utils/qrHelper";

export default function GuestTable({ guests }) {

  const handleManualCheckIn = async (id) => {
    try {
      const res = await axios.post(`${API}/api/invite/${id}/checkin`);

      alert(res.data.message || "Checked-in ✅");
    } catch (err) {
      alert(err.response?.data?.message || "Error checking in");
    }
  };

  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Phone</th>
            <th>Status</th>
            <th>Checked In</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {guests.map((g) => (
            <tr key={g.id}>
              <td style={{fontWeight: 500}}>{g.name}</td>
              <td style={{color: 'var(--text-muted)', fontSize: '0.9rem'}}>{g.phone || "N/A"}</td>
              <td>

                <span className={g.invited ? "badge badge-success" : "badge badge-danger"}>
                  {g.invited ? "Invited ✅" : "Not Invited ❌"}
                </span>
              </td>
              <td>
                <span className={g.checkedIn ? "badge badge-warning" : "badge badge-success"}>
                  {g.checkedIn ? "Yes ⚠️" : "No"}
                </span>
              </td>
              <td className="table-actions">
                {!g.checkedIn ? (
                  <button className="btn btn-primary" style={{padding: '0.4rem 0.6rem', fontSize: '0.8rem'}} onClick={() => handleManualCheckIn(g.id)}>
                    Check In 🎟️
                  </button>
                ) : (
                  <span style={{color: '#9ca3af', fontSize: '0.875rem', fontWeight: 500}}>Done</span>
                )}
                
                <button 
                  className="btn btn-secondary" 
                  style={{padding: '0.4rem 0.6rem', fontSize: '0.8rem', background: '#3b82f6'}}
                  onClick={() => downloadGuestQR(g)}
                >
                  Download QR 📥
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}