 import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

const MyApplications = () => {
  const { api } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/applications/my-applications');
      setApplications(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch (err) {
      console.error('Fetch my applications error:', err.response?.data || err);
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const getStatusColor = (status) => {
    const colors = {
      applied: '#2563eb',
      pending: '#2563eb',
      under_review: '#0891b2',
      shortlisted: '#d97706',
      interview_scheduled: '#7c3aed',
      interview_completed: '#7c3aed',
      selected: '#16a34a',
      offer_accepted: '#16a34a',
      hired: '#16a34a',
      rejected: '#dc2626',
      offer_declined: '#dc2626'
    };
    return colors[status] || '#6b7280';
  };

  const statusLabel = (status) => (status === 'pending' ? 'applied' : status).replace(/_/g, ' ');

  const s = {
    container: { maxWidth: '950px', margin: '30px auto', padding: '20px' },
    card: { background: '#f8f9fa', padding: '20px', borderRadius: '10px', marginBottom: '15px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px', flexWrap: 'wrap' },
    title: { fontSize: '17px', fontWeight: '700', color: '#111827' },
    company: { color: '#4b5563', fontSize: '14px', marginTop: '4px' },
    meta: { color: '#6b7280', fontSize: '12px', marginTop: '6px' },
    status: { padding: '6px 13px', borderRadius: '20px', color: 'white', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase' }
  };

  if (loading) return <div style={s.container}>⏳ Loading applications...</div>;

  return (
    <div style={s.container}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        <h2>📋 My Applications ({applications.length})</h2>
        <button onClick={fetchApplications} style={{ padding: '8px 14px', border: '1px solid #16213e', background: 'white', borderRadius: '6px', cursor: 'pointer' }}>
          🔄 Refresh
        </button>
      </div>

      {applications.map((app) => {
        const job = app.job_id || {};
        const status = app.status || 'applied';
        return (
          <div key={app._id} style={s.card}>
            <div style={{ flex: 1, minWidth: '280px' }}>
              <div style={s.title}>{job.title || 'Job'}</div>
              <div style={s.company}>🏢 {job.company_name || 'Company'} • 📍 {job.location || 'N/A'}</div>
              <div style={s.meta}>
                Applied CGPA: {app.applied_cgpa ?? 0} • Applied: {new Date(app.applied_at || app.createdAt).toLocaleDateString()}
              </div>
              {app.feedback && (
                <div style={{ marginTop: '8px', fontSize: '13px', color: '#374151' }}>
                  💬 Company feedback: {app.feedback}
                </div>
              )}
            </div>
            <div style={{ ...s.status, background: getStatusColor(status) }}>
              {statusLabel(status)}
            </div>
          </div>
        );
      })}

      {applications.length === 0 && (
        <div style={{ padding: '30px', background: '#f8f9fa', borderRadius: '10px', color: '#6b7280' }}>
          No applications yet. Go to Jobs page to apply!
        </div>
      )}
    </div>
  );
};

export default MyApplications;
