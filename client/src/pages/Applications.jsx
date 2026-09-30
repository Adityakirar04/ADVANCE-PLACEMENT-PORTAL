 import { useEffect, useState } from 'react';

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/v1/applications/my-applications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setApplications(data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = { pending: '#f59e0b', shortlisted: '#059669', rejected: '#dc2626', hired: '#4f46e5' };
    return colors[status] || '#6b7280';
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="page-container">
      <h1>📄 My Applications</h1>
      {applications.length === 0 ? (
        <div className="empty-state">
          <p>No applications yet</p>
          <a href="/jobs" className="btn-primary">Browse Jobs</a>
        </div>
      ) : (
        <div className="applications-list">
          {applications.map(app => (
            <div key={app._id} className="application-card">
              <div className="app-info">
                <h3>{app.job_title || 'Job'}</h3>
                <p>🏢 {app.company_name || 'Company'}</p>
                <p>📍 {app.location || 'N/A'}</p>
                <span className="status-badge" style={{ background: getStatusColor(app.status) }}>
                  {app.status}
                </span>
              </div>
              <div className="app-meta">
                <p>Applied: {new Date(app.createdAt).toLocaleDateString()}</p>
                {app.match_score && <p>🎯 Match: {app.match_score}%</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Applications;