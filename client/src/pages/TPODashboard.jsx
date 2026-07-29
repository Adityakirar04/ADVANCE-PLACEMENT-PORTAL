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

  const s = {
    container: { maxWidth: '1000px', margin: '30px auto', padding: '20px' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '30px' },
    statCard: { background: '#16213e', color: 'white', padding: '20px', borderRadius: '10px', textAlign: 'center' },
    statValue: { fontSize: '32px', fontWeight: 'bold', color: '#e94560' },
    table: { width: '100%', borderCollapse: 'collapse', marginTop: '20px' },
    th: { background: '#16213e', color: 'white', padding: '12px', textAlign: 'left' },
    td: { padding: '10px', borderBottom: '1px solid #ddd' }
  };

  if (!stats) return <div style={{ textAlign: 'center', marginTop: '100px' }}>Loading...</div>;

  return (
    <div style={s.container}>
      <h2>📊 TPO Dashboard</h2>
      <div style={s.grid}>
        <div style={s.statCard}><div style={s.statValue}>{stats.overview.totalStudents}</div><div>Total Students</div></div>
        <div style={s.statCard}><div style={s.statValue}>{stats.overview.placedStudents}</div><div>Placed</div></div>
        <div style={s.statCard}><div style={s.statValue}>{stats.overview.unplacedStudents}</div><div>Unplaced</div></div>
        <div style={s.statCard}><div style={s.statValue}>{stats.overview.averageCgpa}</div><div>Avg CGPA</div></div>
        <div style={s.statCard}><div style={s.statValue}>{stats.overview.totalCompanies}</div><div>Companies</div></div>
        <div style={s.statCard}><div style={s.statValue}>{stats.overview.activeJobs}</div><div>Active Jobs</div></div>
        <div style={s.statCard}><div style={s.statValue}>{stats.overview.totalApplications}</div><div>Applications</div></div>
      </div>
      <h3>📚 Branch-wise Stats</h3>
      <table style={s.table}>
        <thead>
          <tr><th style={s.th}>Branch</th><th style={s.th}>Total</th><th style={s.th}>Placed</th><th style={s.th}>Avg CGPA</th></tr>
        </thead>
        <tbody>
          {stats.branchWise.map((b) => (
            <tr key={b._id}><td style={s.td}>{b._id}</td><td style={s.td}>{b.total}</td><td style={s.td}>{b.placed}</td><td style={s.td}>{b.avgCgpa?.toFixed(2)}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TPODashboard;