 import  { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

function StudentJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [applying, setApplying] = useState(null);
  const { apiFetch } = useAuth();

  useEffect(() => { fetchJobs(); }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true); setError('');
      const data = await apiFetch('/jobs');
      if (data.success) setJobs(data.jobs || []);
      else setError(data.message || 'Failed to load jobs');
    } catch (err) { setError(err.message || 'Failed to load jobs'); }
    finally { setLoading(false); }
  };

  const handleApply = async (jobId) => {
    try {
      setApplying(jobId); setMessage('');
      const data = await apiFetch(`/jobs/${jobId}/apply`, { method: 'POST' });
      if (data.success) { setMessage('Application submitted!'); setTimeout(() => setMessage(''), 3000); }
      else setError(data.message || 'Failed to apply');
    } catch (err) { setError(err.message || 'Failed to apply'); }
    finally { setApplying(null); }
  };

  const getCompanyName = (job) => {
    if (job.company_name && job.company_name !== 'Unknown Company') return job.company_name;
    if (job.company?.name) return job.company.name;
    if (job.company_profile?.company_name) return job.company_profile.company_name;
    return 'Unknown Company';
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>Loading jobs...</div>;

  return (
    <div>
      <h1 style={{ marginBottom: '10px' }}>Available Jobs</h1>
      <p style={{ color: '#666', marginBottom: '20px' }}>Find and apply to your dream jobs</p>
      {message && <div style={{ padding: '12px', background: '#e8f5e9', color: '#2e7d32', borderRadius: '4px', marginBottom: '15px' }}>{message}</div>}
      {error && <div style={{ padding: '12px', background: '#ffebee', color: '#c62828', borderRadius: '4px', marginBottom: '15px' }}>{error} <button onClick={fetchJobs} style={{ marginLeft: '10px', padding: '4px 12px', background: '#c62828', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Retry</button></div>}
      {jobs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px', background: 'white', borderRadius: '8px' }}>
          <h3>No jobs available</h3><p style={{ color: '#666' }}>Check back later!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '15px' }}>
          {jobs.map(job => (
            <div key={job._id} style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: '4px solid #1976d2' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <div><h3 style={{ margin: '0 0 5px 0', color: '#1976d2' }}>{job.title}</h3><p style={{ margin: 0, color: '#666', fontSize: '14px' }}>{getCompanyName(job)}</p></div>
                <span style={{ padding: '4px 12px', background: job.is_active ? '#e8f5e9' : '#ffebee', color: job.is_active ? '#2e7d32' : '#c62828', borderRadius: '12px', fontSize: '12px', fontWeight: '500' }}>{job.is_active ? 'Active' : 'Closed'}</span>
              </div>
              <p style={{ color: '#444', lineHeight: '1.5', marginBottom: '15px' }}>{job.description}</p>
              <div style={{ display: 'flex', gap: '15px', marginBottom: '15px', flexWrap: 'wrap' }}>
                {job.location && <span style={{ fontSize: '13px', color: '#666' }}>{job.location}</span>}
                {job.job_type && <span style={{ fontSize: '13px', color: '#666' }}>{job.job_type}</span>}
                {job.salary && <span style={{ fontSize: '13px', color: '#666' }}>{job.salary}</span>}
              </div>
              {job.skills_required?.length > 0 && (
                <div style={{ marginBottom: '15px' }}>
                  {job.skills_required.map((skill, idx) => <span key={idx} style={{ display: 'inline-block', padding: '4px 10px', background: '#e3f2fd', color: '#1976d2', borderRadius: '12px', fontSize: '12px', marginRight: '8px', marginBottom: '5px' }}>{skill}</span>)}
                </div>
              )}
              <button onClick={() => handleApply(job._id)} disabled={applying === job._id || !job.is_active} style={{ padding: '8px 24px', background: !job.is_active ? '#ccc' : applying === job._id ? '#90caf9' : '#1976d2', color: 'white', border: 'none', borderRadius: '4px', cursor: !job.is_active ? 'not-allowed' : 'pointer', fontSize: '14px', fontWeight: '500' }}>
                {applying === job._id ? 'Applying...' : !job.is_active ? 'Closed' : 'Apply Now'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default StudentJobs;