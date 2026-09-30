 import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

const STATUS_STEPS = [
  { key: 'applied', label: 'Applied' },
  { key: 'under_review', label: 'Under Review' },
  { key: 'shortlisted', label: 'Shortlisted' },
  { key: 'interview_scheduled', label: 'Interview Scheduled' },
  { key: 'interview_completed', label: 'Interview Completed' },
  { key: 'selected', label: 'Selected' },
  { key: 'offer_accepted', label: 'Offer Accepted' },
  { key: 'hired', label: 'Hired' }
];

const MyApplications = () => {
  const { api } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchApplications = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await api.get('/applications/my-applications');
      setApplications(Array.isArray(res.data?.data) ? res.data.data : []);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Fetch my applications error:', err.response?.data || err);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    fetchApplications();
    // Company-side status changes should appear automatically on the student portal.
    const timer = setInterval(() => fetchApplications(true), 15000);
    return () => clearInterval(timer);
  }, [fetchApplications]);

  const normalizeStatus = (status) => status === 'pending' ? 'applied' : (status || 'applied');

  const getStatusColor = (status) => {
    const colors = {
      applied: '#2563eb',
      under_review: '#0891b2',
      shortlisted: '#d97706',
      interview_scheduled: '#7c3aed',
      interview_completed: '#7c3aed',
      selected: '#16a34a',
      offer_accepted: '#16a34a',
      hired: '#15803d',
      rejected: '#dc2626',
      offer_declined: '#dc2626'
    };
    return colors[status] || '#6b7280';
  };

  const getStepIndex = (status) => STATUS_STEPS.findIndex(step => step.key === status);

  const statusLabel = (status) => normalizeStatus(status).replace(/_/g, ' ');

  const formatDateTime = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleString([], {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const s = {
    container: { maxWidth: '1050px', margin: '30px auto', padding: '20px' },
    card: { background: '#fff', padding: '22px', borderRadius: '14px', marginBottom: '18px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', border: '1px solid #e5e7eb' },
    title: { fontSize: '19px', fontWeight: '800', color: '#111827' },
    company: { color: '#4b5563', fontSize: '14px', marginTop: '5px' },
    meta: { color: '#6b7280', fontSize: '12px', marginTop: '7px' },
    status: { padding: '7px 14px', borderRadius: '20px', color: 'white', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase' }
  };

  if (loading) return <div style={s.container}>⏳ Loading applications...</div>;

  return (
    <div style={s.container}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '18px' }}>
        <div>
          <h2 style={{ margin: 0 }}>📋 My Applications ({applications.length})</h2>
          <div style={{ color: '#6b7280', fontSize: '12px', marginTop: '5px' }}>
            Track every application stage from submission to final hiring.
            {lastUpdated && ` • Updated ${lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
          </div>
        </div>
        <button onClick={() => fetchApplications()} style={{ padding: '8px 14px', border: '1px solid #16213e', background: 'white', borderRadius: '6px', cursor: 'pointer' }}>
          🔄 Refresh
        </button>
      </div>

      {applications.map((app) => {
        const job = app.job_id || {};
        const status = normalizeStatus(app.status);
        const rejected = status === 'rejected' || status === 'offer_declined';
        const stepIndex = getStepIndex(status);

        return (
          <div key={app._id} style={s.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '18px', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '280px' }}>
                <div style={s.title}>{job.title || 'Job'}</div>
                <div style={s.company}>🏢 {job.company_name || 'Company'} • 📍 {job.location || 'N/A'}</div>
                <div style={s.meta}>
                  Applied CGPA: {app.applied_cgpa ?? 0} • Applied: {new Date(app.applied_at || app.createdAt).toLocaleDateString()}
                </div>
                {app.feedback && (
                  <div style={{ marginTop: '10px', fontSize: '13px', color: '#374151', background: '#f8fafc', padding: '9px 11px', borderRadius: '8px' }}>
                    💬 Company feedback: {app.feedback}
                  </div>
                )}
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ ...s.status, background: getStatusColor(status), display: 'inline-block' }}>
                  {statusLabel(status)}
                </div>
                {status === 'interview_scheduled' && (
                  <div style={{ marginTop: '9px', fontSize: '12px', color: '#6d28d9', fontWeight: '700' }}>
                    📅 Scheduled: {formatDateTime(app.interview_scheduled_at)}
                  </div>
                )}
              </div>
            </div>

            {!rejected && (
              <div style={{ marginTop: '22px', overflowX: 'auto', paddingBottom: '4px' }}>
                <div style={{ display: 'flex', minWidth: '760px', alignItems: 'flex-start' }}>
                  {STATUS_STEPS.map((step, index) => {
                    const active = stepIndex >= index;
                    const current = step.key === status;
                    return (
                      <div key={step.key} style={{ flex: 1, position: 'relative', textAlign: 'center' }}>
                        {index > 0 && (
                          <div style={{ position: 'absolute', top: '10px', right: '50%', width: '100%', height: '3px', background: active ? '#7c3aed' : '#e5e7eb', zIndex: 0 }} />
                        )}
                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', margin: '0 auto', background: active ? '#7c3aed' : '#e5e7eb', border: current ? '3px solid #ddd6fe' : 'none', position: 'relative', zIndex: 1 }} />
                        <div style={{ marginTop: '7px', fontSize: '11px', color: active ? '#374151' : '#9ca3af', fontWeight: current ? '800' : '500' }}>
                          {step.label}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {rejected && (
              <div style={{ marginTop: '18px', padding: '11px 13px', background: '#fef2f2', color: '#991b1b', borderRadius: '8px', fontSize: '13px', fontWeight: '600' }}>
                ❌ This application is no longer progressing in the hiring process.
              </div>
            )}
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
