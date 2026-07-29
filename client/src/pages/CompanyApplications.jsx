 import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

const CompanyApplications = () => {
  const { api } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const fetchMyJobs = async () => {
      try {
        const res = await api.get('/jobs/my-jobs');
        if (cancelled) return;
        setJobs(res.data.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchMyJobs();
    return () => { cancelled = true; };
  }, [api]);

  useEffect(() => {
    if (!selectedJob) return;
    let cancelled = false;
    const fetchApplications = async () => {
      try {
        const res = await api.get(`/applications/job/${selectedJob}`);
        if (cancelled) return;
        setApplications(res.data.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchApplications();
    return () => { cancelled = true; };
  }, [api, selectedJob, refreshKey]);

  const updateStatus = useCallback(async (appId, status) => {
    try {
      await api.put(`/applications/${appId}/status`, { status });
      alert(`Status updated to ${status}`);
      setRefreshKey((k) => k + 1);
    } catch {
      alert('Failed to update status');
    }
  }, [api]);

  const s = {
    container: { maxWidth: '1000px', margin: '30px auto', padding: '20px' },
    jobList: { display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' },
    jobBtn: { padding: '8px 16px', border: '1px solid #16213e', background: 'white', borderRadius: '5px', cursor: 'pointer' },
    activeJobBtn: { padding: '8px 16px', border: '1px solid #16213e', background: '#16213e', color: 'white', borderRadius: '5px', cursor: 'pointer' },
    card: { background: '#f8f9fa', padding: '15px', borderRadius: '8px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    statusSelect: { padding: '5px', borderRadius: '4px' }
  };

  return (
    <div style={s.container}>
      <h2>📨 Applications</h2>
      <div style={s.jobList}>
        {jobs.map((job) => (
          <button key={job._id} type="button" style={selectedJob === job._id ? s.activeJobBtn : s.jobBtn} onClick={() => setSelectedJob(job._id)}>
            {job.title}
          </button>
        ))}
      </div>
      {selectedJob && (
        <>
          <h3>Applicants ({applications.length})</h3>
          {applications.map((app) => (
            <div key={app._id} style={s.card}>
              <div>
                <div><b>{app.student_id?.enrollment_number}</b> • {app.student_id?.branch}</div>
                <div style={{ fontSize: '13px', color: '#666' }}>
                  CGPA: {app.applied_cgpa} • Applied: {new Date(app.applied_at).toLocaleDateString()}
                </div>
              </div>
              <div>
                <span style={{ padding: '4px 10px', borderRadius: '12px', background: app.status === 'selected' ? '#27ae60' : app.status === 'rejected' ? '#e74c3c' : '#3498db', color: 'white', fontSize: '12px', marginRight: '10px' }}>
                  {app.status}
                </span>
                <select style={s.statusSelect} value={app.status} onChange={(e) => updateStatus(app._id, e.target.value)}>
                  <option value="applied">Applied</option>
                  <option value="shortlisted">Shortlisted</option>
                  <option value="interview_scheduled">Interview Scheduled</option>
                  <option value="selected">Selected</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default CompanyApplications;