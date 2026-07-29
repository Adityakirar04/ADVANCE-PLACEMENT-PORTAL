 import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

const Jobs = () => {
  const { api, user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetchJobs = async () => {
      try {
        const res = await api.get('/jobs/');
        if (cancelled) return;
        setJobs(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchJobs();
    return () => { cancelled = true; };
  }, [api]);

  const handleApply = useCallback(async (jobId) => {
    try {
      await api.post('/applications/apply', { job_id: jobId });
      alert('✅ Application submitted successfully!');
    } catch (err) {
      alert('❌ ' + (err.response?.data?.message || 'Apply failed'));
    }
  }, [api]);

  const s = {
    container: { maxWidth: '1000px', margin: '30px auto', padding: '20px' },
    card: { background: '#f8f9fa', padding: '20px', borderRadius: '10px', marginBottom: '15px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', borderLeft: '4px solid #e94560' },
    title: { fontSize: '18px', fontWeight: 'bold', color: '#16213e' },
    company: { color: '#666', marginBottom: '10px' },
    details: { display: 'flex', gap: '15px', flexWrap: 'wrap', margin: '10px 0', fontSize: '14px' },
    btn: { background: '#16213e', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '5px', cursor: 'pointer', marginTop: '10px' }
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: '100px' }}>Loading jobs...</div>;

  return (
    <div style={s.container}>
      <h2>💼 Available Jobs ({jobs.length})</h2>
      {jobs.map((job) => (
        <div key={job._id} style={s.card}>
          <div style={s.title}>{job.title}</div>
          <div style={s.company}>🏢 {job.company_id?.company_name} • {job.company_id?.company_type}</div>
          <div style={s.details}>
            <span>📍 {job.location}</span>
            <span>💰 ₹{(job.ctc_min / 100000).toFixed(1)}L - ₹{(job.ctc_max / 100000).toFixed(1)}L</span>
            <span>📊 Min CGPA: {job.min_cgpa}</span>
            <span>📚 Backlogs: {job.max_backlogs}</span>
          </div>
          <div style={{ fontSize: '13px', color: '#555', margin: '10px 0' }}><b>Skills:</b> {job.required_skills?.join(', ')}</div>
          <div style={{ fontSize: '13px', color: '#555', marginBottom: '10px' }}><b>Branches:</b> {job.eligible_branches?.join(', ')}</div>
          <div style={{ fontSize: '12px', color: '#888' }}>📝 {job.description}</div>
          {user?.role === 'student' && <button type="button" style={s.btn} onClick={() => handleApply(job._id)}>Apply Now</button>}
        </div>
      ))}
    </div>
  );
};

export default Jobs;