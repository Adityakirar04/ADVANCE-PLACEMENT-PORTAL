 import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

const MyApplications = () => {
  const { api } = useAuth();
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    let cancelled = false;
    const fetchApplications = async () => {
      try {
        const res = await api.get('/applications/my-applications');
        if (cancelled) return;
        setApplications(res.data.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchApplications();
    return () => { cancelled = true; };
  }, [api]);

  const getStatusColor = useCallback((status) => {
    const colors = {
      applied: '#3498db', shortlisted: '#f39c12', selected: '#27ae60',
      rejected: '#e74c3c', interview_scheduled: '#9b59b6'
    };
    return colors[status] || '#666';
  }, []);

  const s = {
    container: { maxWidth: '900px', margin: '30px auto', padding: '20px' },
    card: { background: '#f8f9fa', padding: '20px', borderRadius: '10px', marginBottom: '15px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    title: { fontSize: '16px', fontWeight: 'bold' },
    company: { color: '#666', fontSize: '14px' },
    status: { padding: '5px 15px', borderRadius: '20px', color: 'white', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' }
  };

  return (
    <div style={s.container}>
      <h2>📋 My Applications ({applications.length})</h2>
      {applications.map((app) => (
        <div key={app._id} style={s.card}>
          <div>
            <div style={s.title}>{app.job_id?.title}</div>
            <div style={s.company}>🏢 {app.job_id?.company_id?.company_name || 'Company'} • 📍 {app.job_id?.location}</div>
            <div style={{ fontSize: '12px', color: '#888', marginTop: '5px' }}>
              Applied CGPA: {app.applied_cgpa} • Applied: {new Date(app.applied_at).toLocaleDateString()}
            </div>
          </div>
          <div style={{ ...s.status, background: getStatusColor(app.status) }}>
            {app.status.replace(/_/g, ' ')}
          </div>
        </div>
      ))}
      {applications.length === 0 && <p>No applications yet. Go to Jobs page to apply!</p>}
    </div>
  );
};

export default MyApplications;