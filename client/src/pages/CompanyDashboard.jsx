 import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

const CompanyDashboard = () => {
  const { api } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState({ totalJobs: 0, activeJobs: 0, closedJobs: 0 });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setMessage('');

      console.log('🔍 Fetching my jobs...');
      const res = await api.get('/jobs/my-jobs');
      console.log('📦 Response:', res);
      console.log('📦 Response data:', res.data);

      // 🔥 BULLETPROOF: Handle any response structure
      let jobList = [];

      if (res.data && Array.isArray(res.data)) {
        // Direct array response
        jobList = res.data;
        console.log('✅ Direct array, jobs:', jobList.length);
      } else if (res.data && res.data.data && Array.isArray(res.data.data)) {
        // { success: true, data: [...] }
        jobList = res.data.data;
        console.log('✅ Nested data, jobs:', jobList.length);
      } else if (res.data && res.data.jobs && Array.isArray(res.data.jobs)) {
        // { jobs: [...] }
        jobList = res.data.jobs;
        console.log('✅ Jobs field, jobs:', jobList.length);
      } else {
        console.error('❌ Unknown response structure:', res.data);
        setMessage('❌ Failed to parse jobs data');
        setLoading(false);
        return;
      }

      setJobs(jobList);
      setStats({
        totalJobs: jobList.length,
        activeJobs: jobList.filter(j => j.status === 'active').length,
        closedJobs: jobList.filter(j => j.status === 'closed').length
      });

    } catch (err) {
      console.error('❌ Fetch error:', err);
      console.error('❌ Error response:', err.response?.data);
      console.error('❌ Error status:', err.response?.status);
      setMessage(`❌ Failed to load jobs: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ============================================
  // DELETE JOB
  // ============================================
  const handleDelete = async (jobId, jobTitle) => {
    if (!confirm(`Delete job "${jobTitle}"? This cannot be undone.`)) return;

    try {
      console.log('🗑️ Deleting job:', jobId);
      const res = await api.delete(`/jobs/${jobId}`);
      console.log('🗑️ Delete response:', res.data);

      if (res.data && res.data.success) {
        setJobs(prev => prev.filter(j => j._id !== jobId));
        setStats(prev => ({
          ...prev,
          totalJobs: prev.totalJobs - 1,
          activeJobs: prev.activeJobs - 1
        }));
        setMessage(`✅ Job "${jobTitle}" deleted`);
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('❌ Delete failed: ' + (res.data?.message || 'Unknown error'));
      }
    } catch (err) {
      console.error('❌ Delete error:', err);
      setMessage('❌ Failed to delete job: ' + (err.response?.data?.message || err.message));
    }
  };

  // ============================================
  // TOGGLE STATUS
  // ============================================
  const toggleStatus = async (jobId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'closed' : 'active';
    try {
      const res = await api.put(`/jobs/${jobId}`, { status: newStatus });
      if (res.data && res.data.success) {
        setJobs(prev => prev.map(j => 
          j._id === jobId ? { ...j, status: newStatus } : j
        ));
        setStats(prev => ({
          ...prev,
          activeJobs: newStatus === 'active' ? prev.activeJobs + 1 : prev.activeJobs - 1,
          closedJobs: newStatus === 'closed' ? prev.closedJobs + 1 : prev.closedJobs - 1
        }));
      }
    } catch (err) {
      setMessage('❌ Failed to update status');
    }
  };

  // ============================================
  // STYLES
  // ============================================
  const s = {
    container: { maxWidth: '1100px', margin: '0 auto', padding: '24px', minHeight: '100vh' },
    header: { fontSize: '26px', fontWeight: '700', color: '#111827', marginBottom: '4px' },
    subheader: { color: '#6b7280', fontSize: '14px', marginBottom: '24px' },
    alert: (isError) => ({
      padding: '12px 16px', borderRadius: '8px', marginBottom: '20px',
      background: isError ? '#fee2e2' : '#d1fae5',
      color: isError ? '#991b1b' : '#065f46',
      fontSize: '14px', fontWeight: '500'
    }),
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '28px' },
    statCard: (color) => ({
      background: '#fff', borderRadius: '12px', padding: '20px',
      borderLeft: `4px solid ${color}`, textAlign: 'center',
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
    }),
    statValue: (color) => ({ fontSize: '28px', fontWeight: '700', color }),
    statLabel: { fontSize: '13px', color: '#6b7280', marginTop: '4px' },
    section: { background: '#fff', borderRadius: '12px', padding: '24px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
    sectionTitle: { margin: '0 0 16px 0', fontSize: '18px', fontWeight: '700', color: '#111827' },
    table: { width: '100%', borderCollapse: 'collapse', fontSize: '14px' },
    th: { padding: '12px 8px', color: '#374151', textAlign: 'left', borderBottom: '2px solid #e5e7eb', fontWeight: '600' },
    td: { padding: '14px 8px', borderBottom: '1px solid #f3f4f6' },
    title: { fontWeight: '600', color: '#111827' },
    badge: (isActive) => ({
      display: 'inline-block', padding: '4px 10px', borderRadius: '6px',
      fontSize: '12px', fontWeight: '600',
      background: isActive ? '#d1fae5' : '#fee2e2',
      color: isActive ? '#166534' : '#991b1b'
    }),
    btnGroup: { display: 'flex', gap: '8px', justifyContent: 'flex-end' },
    btnToggle: (isActive) => ({
      padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '600',
      border: 'none', cursor: 'pointer',
      background: isActive ? '#fef3c7' : '#d1fae5',
      color: isActive ? '#92400e' : '#166534'
    }),
    btnDelete: {
      padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '600',
      border: '1px solid #fecaca', cursor: 'pointer',
      background: '#fee2e2', color: '#991b1b'
    },
    empty: { textAlign: 'center', padding: '40px', color: '#6b7280', fontSize: '14px' }
  };

  return (
    <div style={s.container}>
      <h2 style={s.header}>🏢 Company Dashboard</h2>
      <p style={s.subheader}>Manage your job postings and applications.</p>

      {message && (
        <div style={s.alert(message.startsWith('❌'))}>
          {message}
        </div>
      )}

      {/* Stats */}
      <div style={s.statsGrid}>
        {[
          { label: 'Total Jobs', value: stats.totalJobs, color: '#1e3a8a' },
          { label: 'Active Jobs', value: stats.activeJobs, color: '#166534' },
          { label: 'Closed Jobs', value: stats.closedJobs, color: '#991b1b' },
        ].map((stat, i) => (
          <div key={i} style={s.statCard(stat.color)}>
            <div style={s.statValue(stat.color)}>{stat.value}</div>
            <div style={s.statLabel}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Jobs Table */}
      <div style={s.section}>
        <h3 style={s.sectionTitle}>📋 My Job Postings ({jobs.length})</h3>

        {loading ? (
          <div style={s.empty}>Loading...</div>
        ) : jobs.length === 0 ? (
          <div style={s.empty}>
            📭 No jobs posted yet. <a href="/post-job" style={{ color: '#1e3a8a' }}>Post your first job!</a>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>Job Title</th>
                  <th style={s.th}>Location</th>
                  <th style={s.th}>Status</th>
                  <th style={s.th}>Posted</th>
                  <th style={{ ...s.th, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map(job => (
                  <tr key={job._id}>
                    <td style={s.td}>
                      <div style={s.title}>{job.title}</div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>
                        {job.required_skills?.slice(0, 3).join(', ') || 'No skills'}
                      </div>
                    </td>
                    <td style={s.td}>{job.location || '—'}</td>
                    <td style={s.td}>
                      <span style={s.badge(job.status === 'active')}>
                        {job.status === 'active' ? '● Active' : '○ Closed'}
                      </span>
                    </td>
                    <td style={s.td}>{new Date(job.createdAt).toLocaleDateString()}</td>
                    <td style={{ ...s.td, textAlign: 'right' }}>
                      <div style={s.btnGroup}>
                        <button
                          onClick={() => toggleStatus(job._id, job.status)}
                          style={s.btnToggle(job.status === 'active')}
                        >
                          {job.status === 'active' ? 'Close' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleDelete(job._id, job.title)}
                          style={s.btnDelete}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyDashboard;