 import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

const CompanyApplications = () => {
  const { api } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [jobsLoading, setJobsLoading] = useState(true);

  const fetchMyJobs = useCallback(async () => {
    try {
      setJobsLoading(true);
      const res = await api.get('/jobs/my-jobs');
      const jobList = Array.isArray(res.data?.data) ? res.data.data : [];
      setJobs(jobList);

      if (!selectedJob && jobList.length > 0) {
        setSelectedJob(jobList[0]._id);
      }
    } catch (err) {
      console.error('Fetch company jobs error:', err);
    } finally {
      setJobsLoading(false);
    }
  }, [api, selectedJob]);

  const fetchApplications = useCallback(async () => {
    if (!selectedJob) {
      setApplications([]);
      return;
    }

    try {
      setLoading(true);
      // Correct backend endpoint: /applications/job/:jobId
      const res = await api.get(`/applications/job/${selectedJob}`);
      setApplications(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch (err) {
      console.error('Fetch applications error:', err.response?.data || err);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  }, [api, selectedJob]);

  useEffect(() => {
    fetchMyJobs();
  }, [fetchMyJobs]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const updateStatus = useCallback(async (appId, status) => {
    try {
      const res = await api.put(`/applications/${appId}/status`, { status });
      if (res.data?.success) {
        alert(`✅ Application moved to: ${status.replace(/_/g, ' ')}`);
        await fetchApplications();
      }
    } catch (err) {
      console.error('Update status error:', err.response?.data || err);
      alert(err.response?.data?.message || 'Failed to update application status');
    }
  }, [api, fetchApplications]);

  const statusColor = (status) => {
    if (status === 'selected' || status === 'offer_accepted' || status === 'hired') return '#16a34a';
    if (status === 'rejected' || status === 'offer_declined') return '#dc2626';
    if (status === 'shortlisted') return '#d97706';
    if (status === 'interview_scheduled' || status === 'interview_completed') return '#7c3aed';
    return '#2563eb';
  };

  const s = {
    container: { maxWidth: '1100px', margin: '30px auto', padding: '20px' },
    jobList: { display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' },
    jobBtn: { padding: '9px 16px', border: '1px solid #16213e', background: 'white', borderRadius: '7px', cursor: 'pointer' },
    activeJobBtn: { padding: '9px 16px', border: '1px solid #16213e', background: '#16213e', color: 'white', borderRadius: '7px', cursor: 'pointer' },
    card: { background: '#f8f9fa', padding: '16px', borderRadius: '10px', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px', flexWrap: 'wrap' },
    statusSelect: { padding: '7px', borderRadius: '5px', border: '1px solid #d1d5db' },
    name: { fontSize: '16px', fontWeight: '700', color: '#111827' },
    meta: { fontSize: '13px', color: '#4b5563', marginTop: '4px' },
    resume: { display: 'inline-block', marginTop: '7px', color: '#2563eb', fontSize: '13px', fontWeight: '600' }
  };

  return (
    <div style={s.container}>
      <h2>📨 Applications</h2>
      <p style={{ color: '#6b7280' }}>
        Review applicants and move them through the hiring process. Students will receive a notification when you change their status.
      </p>

      {jobsLoading ? (
        <p>⏳ Loading your jobs...</p>
      ) : jobs.length === 0 ? (
        <p>No jobs posted yet.</p>
      ) : (
        <>
          <div style={s.jobList}>
            {jobs.map((job) => (
              <button
                key={job._id}
                type="button"
                style={selectedJob === job._id ? s.activeJobBtn : s.jobBtn}
                onClick={() => setSelectedJob(job._id)}
              >
                {job.title} ({job.application_count || 0})
              </button>
            ))}
          </div>

          {selectedJob && (
            <>
              <h3>Applicants ({applications.length})</h3>

              {loading ? (
                <p>⏳ Loading applicants...</p>
              ) : applications.length === 0 ? (
                <div style={{ padding: '25px', background: '#f8f9fa', borderRadius: '10px' }}>
                  No applications for this job yet.
                </div>
              ) : (
                applications.map((app) => {
                  const student = app.student_id || {};
                  const status = app.status === 'pending' ? 'applied' : app.status;

                  return (
                    <div key={app._id} style={s.card}>
                      <div style={{ flex: 1, minWidth: '280px' }}>
                        <div style={s.name}>
                          {student.first_name || student.last_name
                            ? `${student.first_name || ''} ${student.last_name || ''}`.trim()
                            : 'Student'}
                        </div>
                        <div style={s.meta}>📧 {student.email || 'Email unavailable'}</div>
                        <div style={s.meta}>🎓 {student.enrollment_number || 'Enrollment unavailable'} • {student.branch || 'Branch unavailable'}</div>
                        <div style={s.meta}>📊 CGPA: {app.applied_cgpa ?? student.cgpa ?? 0} • Backlogs: {student.backlogs ?? 0}</div>
                        <div style={s.meta}>📅 Applied: {new Date(app.applied_at || app.createdAt).toLocaleDateString()}</div>
                        {student.resume_url && (
                          <a href={student.resume_url} target="_blank" rel="noreferrer" style={s.resume}>📄 View Resume</a>
                        )}
                      </div>

                      <div style={{ minWidth: '220px', textAlign: 'right' }}>
                        <span style={{
                          display: 'inline-block', padding: '5px 10px', borderRadius: '12px',
                          background: statusColor(status), color: 'white', fontSize: '12px',
                          marginBottom: '8px', textTransform: 'capitalize'
                        }}>
                          {status.replace(/_/g, ' ')}
                        </span>
                        <br />
                        <select
                          style={s.statusSelect}
                          value={status}
                          onChange={(e) => updateStatus(app._id, e.target.value)}
                        >
                          <option value="applied">Applied</option>
                          <option value="under_review">Under Review</option>
                          <option value="shortlisted">Shortlisted</option>
                          <option value="interview_scheduled">Interview Scheduled</option>
                          <option value="interview_completed">Interview Completed</option>
                          <option value="selected">Selected</option>
                          <option value="rejected">Rejected</option>
                          <option value="offer_accepted">Offer Accepted</option>
                          <option value="offer_declined">Offer Declined</option>
                          <option value="hired">Hired</option>
                        </select>
                      </div>
                    </div>
                  );
                })
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default CompanyApplications;
