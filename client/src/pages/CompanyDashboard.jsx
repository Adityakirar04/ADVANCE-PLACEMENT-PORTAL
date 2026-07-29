 import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

const CompanyDashboard = () => {
  const { api, user } = useAuth();
  const [myJobs, setMyJobs] = useState([]);

  useEffect(() => {
    let cancelled = false;
    const fetchMyJobs = async () => {
      try {
        const res = await api.get('/jobs/my-jobs');
        if (cancelled) return;
        setMyJobs(res.data.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchMyJobs();
    return () => { cancelled = true; };
  }, [api]);

  const s = {
    container: { maxWidth: '900px', margin: '30px auto', padding: '20px' },
    card: { background: '#f8f9fa', padding: '20px', borderRadius: '10px', marginBottom: '15px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' },
    stats: { display: 'flex', gap: '20px', marginBottom: '20px' },
    statBox: { background: '#16213e', color: 'white', padding: '20px', borderRadius: '10px', textAlign: 'center', flex: 1 }
  };

  return (
    <div style={s.container}>
      <h2>🏢 Welcome, {user?.first_name}!</h2>
      <div style={s.stats}>
        <div style={s.statBox}>
          <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{myJobs.length}</div>
          <div>Jobs Posted</div>
        </div>
      </div>
      <h3>📌 My Jobs</h3>
      {myJobs.map((job) => (
        <div key={job._id} style={s.card}>
          <h4>{job.title}</h4>
          <p style={{ color: '#666' }}>Status: <b>{job.status}</b> • Applications: {job.total_applications}</p>
          <p style={{ fontSize: '13px' }}>📍 {job.location} • 💰 ₹{(job.ctc_min / 100000).toFixed(1)}L - ₹{(job.ctc_max / 100000).toFixed(1)}L</p>
        </div>
      ))}
    </div>
  );
};

export default CompanyDashboard;