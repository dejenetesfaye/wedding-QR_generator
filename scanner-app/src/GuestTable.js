import axios from "axios";
import API from "./config";

export default function GuestTable({ guests }) {

  const handleManualCheckIn = async (id) => {
    try {
      const res = await axios.post(`${API}/invite/${id}/checkin`);
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
            <th>Status</th>
            <th>Checked In</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {guests.map((g) => (
            <tr key={g.id}>
              <td style={{fontWeight: 500}}>{g.name}</td>
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
              <td>
                {!g.checkedIn ? (
                  <button className="btn btn-primary" style={{padding: '0.4rem 0.8rem', fontSize: '0.875rem'}} onClick={() => handleManualCheckIn(g.id)}>
                    Check In
                  </button>
                ) : (
                  <span style={{color: '#9ca3af', fontSize: '0.875rem', fontWeight: 500}}>Done</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}