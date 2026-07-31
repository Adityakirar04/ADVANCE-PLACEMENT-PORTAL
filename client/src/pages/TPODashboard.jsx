 import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

const TPODashboard = () => {
  const { api } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const fetchStats = async () => {
      try {
        const res = await api.get('/tpo/stats');
        if (cancelled) return;
        setStats(res.data.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();
    return () => { cancelled = true; };
  }, [api]);

  const StatCard = ({ icon, value, label, color }) => (
    <div style={{
      background: '#ffffff',
      borderRadius: '12px',
      padding: '24px 16px',
      textAlign: 'center',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      border: '1px solid #e5e7eb',
      transition: 'transform 0.2s',
      cursor: 'default'
    }}>
      <div style={{ fontSize: '32px', marginBottom: '8px' }}>{icon}</div>
      <div style={{ fontSize: '28px', fontWeight: '700', color: color || '#1f2937' }}>{value}</div>
      <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px', fontWeight: '500' }}>{label}</div>
    </div>
  );

  if (!stats) return (
    <div style={{ textAlign: 'center', marginTop: '100px', color: '#6b7280' }}>
      <div style={{ fontSize: '24px' }}>⏳</div>Loading...
    </div>
  );

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px', background: '#f3f4f6', minHeight: '100vh' }}>
      <h2 style={{ color: '#111827', marginBottom: '24px', fontSize: '24px', fontWeight: '700' }}>📊 TPO Dashboard</h2>
      
      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
        gap: '16px',
        marginBottom: '32px'
      }}>
        <StatCard icon="👨‍🎓" value={stats.overview.totalStudents} label="Total Students" color="#2563eb" />
        <StatCard icon="✅" value={stats.overview.placedStudents} label="Placed" color="#16a34a" />
        <StatCard icon="❌" value={stats.overview.unplacedStudents} label="Unplaced" color="#dc2626" />
        <StatCard icon="📈" value={stats.overview.averageCgpa} label="Avg CGPA" color="#7c3aed" />
        <StatCard icon="🏢" value={stats.overview.totalCompanies} label="Companies" color="#ea580c" />
        <StatCard icon="💼" value={stats.overview.activeJobs} label="Active Jobs" color="#0891b2" />
        <StatCard icon="📝" value={stats.overview.totalApplications} label="Applications" color="#db2777" />
      </div>

      {/* Branch Table */}
      <div style={{
        background: '#ffffff',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        border: '1px solid #e5e7eb',
        overflowX: 'auto'
      }}>
        <h3 style={{ color: '#111827', marginBottom: '16px', fontSize: '18px', fontWeight: '600' }}>📚 Branch-wise Stats</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
          <thead>
            <tr style={{ background: '#f9fafb' }}>
              <th style={{ padding: '12px 16px', textAlign: 'left', color: '#374151', fontWeight: '600', borderBottom: '1px solid #e5e7eb' }}>Branch</th>
              <th style={{ padding: '12px 16px', textAlign: 'center', color: '#374151', fontWeight: '600', borderBottom: '1px solid #e5e7eb' }}>Total</th>
              <th style={{ padding: '12px 16px', textAlign: 'center', color: '#374151', fontWeight: '600', borderBottom: '1px solid #e5e7eb' }}>Placed</th>
              <th style={{ padding: '12px 16px', textAlign: 'center', color: '#374151', fontWeight: '600', borderBottom: '1px solid #e5e7eb' }}>Avg CGPA</th>
              <th style={{ padding: '12px 16px', textAlign: 'center', color: '#374151', fontWeight: '600', borderBottom: '1px solid #e5e7eb' }}>Placement %</th>
            </tr>
          </thead>
          <tbody>
            {stats.branchWise?.map((b) => {
              const pct = b.total > 0 ? ((b.placed / b.total) * 100).toFixed(1) : 0;
              return (
                <tr key={b._id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '12px 16px', color: '#111827', fontWeight: '500' }}>{b._id}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'center', color: '#4b5563' }}>{b.total}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'center', color: '#16a34a', fontWeight: '600' }}>{b.placed}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'center', color: '#7c3aed', fontWeight: '600' }}>{b.avgCgpa?.toFixed(2)}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <span style={{
                      background: pct >= 50 ? '#dcfce7' : '#fee2e2',
                      color: pct >= 50 ? '#166534' : '#991b1b',
                      padding: '4px 10px',
                      borderRadius: '999px',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>{pct}%</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TPODashboard;