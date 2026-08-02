 import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

const TPODashboard = () => {
  const { api } = useAuth();

  const [pendingUsers, setPendingUsers] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [pendingRes, allRes] = await Promise.all([
        api.get('/tpo/pending-users'),
        api.get('/tpo/all-users')
      ]);
      setPendingUsers(pendingRes.data.data || []);
      setStats(allRes.data.stats || { total: 0, pending: 0, approved: 0, rejected: 0 });
    } catch (err) {
      setMessage('❌ Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleApprove = async (userId) => {
    try {
      const res = await api.put(`/tpo/approve-user/${userId}`);
      setPendingUsers(prev => prev.filter(u => u._id !== userId));
      setStats(prev => ({ ...prev, pending: prev.pending - 1, approved: prev.approved + 1 }));
      setMessage(`✅ ${res.data.message}`);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('❌ Approve failed');
    }
  };

  const handleReject = async (userId) => {
    const reason = prompt('Rejection reason (optional):');
    try {
      const res = await api.put(`/tpo/reject-user/${userId}`, { reason: reason || '' });
      setPendingUsers(prev => prev.filter(u => u._id !== userId));
      setStats(prev => ({ ...prev, pending: prev.pending - 1, rejected: prev.rejected + 1 }));
      setMessage(`✅ ${res.data.message}`);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('❌ Reject failed');
    }
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px', background: '#f3f4f6', minHeight: '100vh' }}>
      <h2 style={{ color: '#111827', fontSize: '26px', fontWeight: '700', marginBottom: '4px' }}>
        🎓 TPO Dashboard
      </h2>
      <p style={{ color: '#6b7280', marginBottom: '24px', fontSize: '14px' }}>
        Approve or reject student & company registrations.
      </p>

      {message && (
        <div style={{
          padding: '12px 16px', borderRadius: '8px', marginBottom: '20px',
          background: message.startsWith('✅') ? '#d1fae5' : '#fee2e2',
          color: message.startsWith('✅') ? '#065f46' : '#991b1b',
          fontSize: '14px', fontWeight: '500'
        }}>
          {message}
        </div>
      )}

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        {[
          { label: 'Total Users', value: stats.total, color: '#1e3a8a', bg: '#dbeafe' },
          { label: 'Pending', value: stats.pending, color: '#92400e', bg: '#fef3c7' },
          { label: 'Approved', value: stats.approved, color: '#166534', bg: '#d1fae5' },
          { label: 'Rejected', value: stats.rejected, color: '#991b1b', bg: '#fee2e2' },
        ].map((s, i) => (
          <div key={i} style={{
            background: '#fff', borderRadius: '12px', padding: '20px',
            borderLeft: `4px solid ${s.color}`, textAlign: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
          }}>
            <div style={{ fontSize: '28px', fontWeight: '700', color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Pending Table */}
      <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '700', color: '#111827' }}>
          ⏳ Pending Approvals ({pendingUsers.length})
        </h3>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>Loading...</div>
        ) : pendingUsers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280', fontSize: '14px' }}>
            🎉 No pending approvals! All caught up!
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e5e7eb', textAlign: 'left' }}>
                  <th style={{ padding: '12px 8px', color: '#374151' }}>Name</th>
                  <th style={{ padding: '12px 8px', color: '#374151' }}>Email</th>
                  <th style={{ padding: '12px 8px', color: '#374151' }}>Role</th>
                  <th style={{ padding: '12px 8px', color: '#374151' }}>Date</th>
                  <th style={{ padding: '12px 8px', color: '#374151', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingUsers.map(user => (
                  <tr key={user._id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '14px 8px', fontWeight: '600', color: '#111827' }}>
                      {user.first_name} {user.last_name}
                    </td>
                    <td style={{ padding: '14px 8px', color: '#4b5563' }}>{user.email}</td>
                    <td style={{ padding: '14px 8px' }}>
                      <span style={{
                        padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600',
                        background: user.role === 'student' ? '#dbeafe' : '#fce7f3',
                        color: user.role === 'student' ? '#1e40af' : '#9d174d'
                      }}>
                        {user.role}
                      </span>
                    </td>
                    <td style={{ padding: '14px 8px', color: '#6b7280', fontSize: '13px' }}>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '14px 8px', textAlign: 'right' }}>
                      <button onClick={() => handleApprove(user._id)} style={{
                        padding: '6px 14px', background: '#166534', color: '#fff',
                        border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', marginRight: '8px'
                      }}>
                        ✓ Approve
                      </button>
                      <button onClick={() => handleReject(user._id)} style={{
                        padding: '6px 14px', background: '#fee2e2', color: '#991b1b',
                        border: '1px solid #fecaca', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer'
                      }}>
                        ✕ Reject
                      </button>
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

export default TPODashboard;