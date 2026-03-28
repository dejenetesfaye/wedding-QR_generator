export default function ResultCard({ data, onCheckIn }) {
  if (!data) return null;

  return (
    <div className="result-card">
      <h2>{data.name}</h2>

      <div className="result-details">
        <div>
          <span className="stat-label" style={{display: 'block', marginBottom: '8px'}}>Status</span>
          <span className={data.invited ? "badge badge-success" : "badge badge-danger"}>
            {data.invited ? "Invited ✅" : "Not Invited ❌"}
          </span>
        </div>

        <div>
          <span className="stat-label" style={{display: 'block', marginBottom: '8px'}}>Checked In</span>
          <span className={data.checkedIn ? "badge badge-warning" : "badge badge-success"}>
            {data.checkedIn ? "Yes ⚠️" : "No"}
          </span>
        </div>
      </div>

      <div style={{marginTop: '1.5rem'}}>
        {data.checkedIn ? (
          <div className="checkin-success">
            ENTRY ALLOWED ✅
          </div>
        ) : (
          <button className="btn btn-success" onClick={onCheckIn} style={{width: '100%', fontSize: '1.1rem', padding: '1rem'}}>
             Allow Entry ✅
          </button>
        )}
      </div>
    </div>
  );
}