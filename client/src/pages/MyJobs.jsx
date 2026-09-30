import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const MyJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyJobs();
  }, []);

  const fetchMyJobs = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/v1/jobs/my-jobs', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setJobs(data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this job?')) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/v1/jobs/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchMyJobs();
    } catch (e) {
      alert('Error deleting job');
    }
  };

  const handleStatusToggle = async (id, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      const newStatus = currentStatus === 'active' ? 'closed' : 'active';
      await fetch(`/api/v1/jobs/${id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      fetchMyJobs();
    } catch (e) {
      alert('Error updating job');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>📋 My Jobs</h1>
        <button className="btn-primary" onClick={() => navigate('/post-job')}>+ Post New Job</button>
      </div>

      {jobs.length === 0 ? (
        <div className="empty-state">
          <p>No jobs posted yet</p>
          <button className="btn-primary" onClick={() => navigate('/post-job')}>Post Your First Job</button>
        </div>
      ) : (
        <div className="jobs-grid">
          {jobs.map(job => (
            <div key={job._id} className="job-card">
              <div className="job-header">
                <h3>{job.title}</h3>
                <span className={`status-badge ${job.status}`}>{job.status}</span>
              </div>
              <p className="job-desc">{job.description?.substring(0, 100)}...</p>
              <div className="job-meta">
                <span>📍 {job.location || 'Remote'}</span>
                <span>💰 ₹{job.salary?.min || 0}L - ₹{job.salary?.max || 0}L</span>
                <span>👥 {job.application_count || 0} applications</span>
              </div>
              <div className="job-actions">
                <button onClick={() => handleStatusToggle(job._id, job.status)}>
                  {job.status === 'active' ? '🔒 Close' : '🔓 Activate'}
                </button>
                <button className="btn-danger" onClick={() => handleDelete(job._id)}>🗑️ Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyJobs;