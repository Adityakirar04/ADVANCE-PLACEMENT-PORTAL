 import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { Link } from 'react-router-dom';

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

  const totalApps = myJobs.reduce((sum, j) => sum + (j.total_applications || 0), 0);
  const activeJobs = myJobs.filter(j => j.status === 'active').length;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px', background: '#f3f4f6', minHeight: '100vh' }}>
      <h2 style={{ color: '#111827', marginBottom: '20px', fontSize: '24px', fontWeight: '700' }}>
        🏢 Welcome, {user?.first_name}!
      </h2>

      {/* Stats Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '28px'
      }}>
        <div style={statCardStyle}>
          <div style={{ fontSize: '28px', fontWeight: '800', color: '#1e3a8a' }}>{myJobs.length}</div>
          <div style={{ fontSize: '13px', color: '#6b7280', fontWeight: '500', marginTop: '4px' }}>Total Jobs Posted</div>
        </div>
        <div style={statCardStyle}>
          <div style={{ fontSize: '28px', fontWeight: '800', color: '#059669' }}>{activeJobs}</div>
          <div style={{ fontSize: '13px', color: '#6b7280', fontWeight: '500', marginTop: '4px' }}>Active Jobs</div>
        </div>
        <div style={statCardStyle}>
          <div style={{ fontSize: '28px', fontWeight: '800', color: '#7c3aed' }}>{totalApps}</div>
          <div style={{ fontSize: '13px', color: '#6b7280', fontWeight: '500', marginTop: '4px' }}>Total Applications</div>
        </div>
      </div>

      {/* Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#111827' }}>📌 My Jobs</h3>
        <Link to="/post-job" style={{
          padding: '10px 18px',
          background: '#1e3a8a',
          color: '#ffffff',
          textDecoration: 'none',
          borderRadius: '8px',
          fontSize: '13px',
          fontWeight: '600'
        }}>+ Post New Job</Link>
      </div>

      {/* Jobs Table */}
      <div style={{ background: '#ffffff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #e5e7eb', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
          <thead>
            <tr style={{ background: '#f9fafb' }}>
              <th style={thStyle}>Job Title</th>
              <th style={thStyle}>Location</th>
              <th style={thStyle}>CTC</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Applications</th>
              <th style={thStyle}>Deadline</th>
              <th style={thStyle}>Action</th>
            </tr>
          </thead>
          <tbody>
            {myJobs.map((job) => (
              <tr key={job._id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={tdStyle}>
                  <div style={{ fontWeight: '600', color: '#111827' }}>{job.title}</div>
                  <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>{job.job_type || 'full_time'}</div>
                </td>
                <td style={tdStyle}>📍 {job.location}</td>
                <td style={tdStyle}>💰 ₹{(job.ctc_min / 100000).toFixed(1)}L - ₹{(job.ctc_max / 100000).toFixed(1)}L</td>
                <td style={tdStyle}>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: '700',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    background: job.status === 'active' ? '#d1fae5' : '#fee2e2',
                    color: job.status === 'active' ? '#065f46' : '#991b1b',
                    textTransform: 'uppercase'
                  }}>{job.status}</span>
                </td>
                <td style={{ ...tdStyle, textAlign: 'center', fontWeight: '700', color: '#1e3a8a' }}>
                  {job.total_applications || 0}
                </td>
                <td style={tdStyle}>
                  {job.application_deadline ? new Date(job.application_deadline).toLocaleDateString() : '—'}
                </td>
                <td style={tdStyle}>
                  <Link to="/company-applications" style={{ color: '#2563eb', textDecoration: 'none', fontSize: '13px', fontWeight: '600' }}>
                    View ↗
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {myJobs.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>📭</div>
            <p>No jobs posted yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const statCardStyle = {
  background: '#ffffff',
  borderRadius: '12px',
  padding: '20px',
  textAlign: 'center',
  boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  border: '1px solid #e5e7eb'
};

const thStyle = {
  padding: '12px 16px',
  textAlign: 'left',
  color: '#374151',
  fontWeight: '600',
  fontSize: '12px',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  borderBottom: '1px solid #e5e7eb'
};

const tdStyle = {
  padding: '14px 16px',
  color: '#4b5563',
  fontSize: '13px'
};

export default CompanyDashboard;