export default function ResultCard({ data }) {
  if (!data) return null;

  return (
    <div className="minimal-scanner-result" style={{
      background: data.error ? 'rgba(239, 68, 68, 0.95)' : 'rgba(15, 23, 42, 0.98)',
      backdropFilter: 'blur(10px)'
    }}>
      <h1 style={{fontSize: '3rem', marginBottom: '1rem'}}>{data.error ? '❌' : '✅'}</h1>
      <h2 style={{ fontSize: '2.5rem', margin: '0 0 1rem 0' }}>
        {data.error ? "INVALID QR" : data.name}
      </h2>

      {data.error ? (
        <p style={{ fontSize: '1.2rem'}}>{data.error}</p>
      ) : (
        <div className="checkin-success">
          ENTRY ALLOWED
        </div>
      )}
      
      <button 
        className="btn btn-primary" 
        style={{marginTop: '2rem', padding: '1rem 2rem'}}
        onClick={() => window.location.reload()}
      >
        NEXT GUEST ➡️
      </button>
    </div>
  );
}