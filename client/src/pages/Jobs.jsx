 // client/src/pages/Jobs.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const Jobs = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const res = await fetch('/api/v1/jobs', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await res.json();
      console.log('Jobs API Response:', data);

      if (data.success) {
        setJobs(data.data || []);
      } else {
        setError(data.message || 'Failed to load jobs');
      }
    } catch (err) {
      console.error('Fetch Jobs Error:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (jobId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/v1/applications', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ job_id: jobId })
      });

      const data = await res.json();
      if (data.success) {
        alert('✅ Applied successfully!');
      } else {
        alert(data.message || 'Application failed');
      }
    } catch (err) {
      alert('❌ Failed to apply. Try again.');
    }
  };

  // Helper: Format salary safely
  const formatSalary = (salary) => {
    if (!salary) return 'Not Disclosed';

    // Handle salary_display from backend
    if (salary.formatted) return salary.formatted;

    const min = Number(salary.min) || 0;
    const max = Number(salary.max) || 0;
    const currency = salary.currency || 'INR';
    const symbol = currency === 'INR' ? '₹' : '$';

    if (min === 0 && max === 0) return 'Not Disclosed';
    if (min === 0) return `${symbol}${(max / 100000).toFixed(1)}L`;
    if (max === 0) return `${symbol}${(min / 100000).toFixed(1)}L`;

    return `${symbol}${(min / 100000).toFixed(1)}L - ${symbol}${(max / 100000).toFixed(1)}L`;
  };

  // Helper: Format CGPA safely
  const formatCGPA = (req) => {
    if (!req) return 'Any';

    // Handle requirements_display from backend
    if (req.cgpa !== undefined) {
      const cgpa = Number(req.cgpa);
      return cgpa > 0 ? `CGPA ≥ ${cgpa}` : 'Any CGPA';
    }

    const cgpa = Number(req.cgpa) || 0;
    return cgpa > 0 ? `CGPA ≥ ${cgpa}` : 'Any CGPA';
  };

  // Helper: Format backlogs safely
  const formatBacklogs = (req) => {
    if (!req) return 'No limit';
    const backlogs = Number(req.backlogs) || 0;
    return `Backlogs ≤ ${backlogs}`;
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <div style={{ fontSize: '24px' }}>⏳ Loading jobs...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '50px', color: '#e94560' }}>
        <div style={{ fontSize: '20px' }}>❌ {error}</div>
        <button onClick={fetchJobs} style={styles.retryBtn}>Retry</button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>💼 Available Jobs ({jobs.length})</h1>

      {jobs.length === 0 && (
        <div style={styles.empty}>
          <p>No jobs available right now. Check back later!</p>
        </div>
      )}

      <div style={styles.grid}>
        {jobs.map((job) => (
          <div key={job._id} style={styles.card}>
            {/* Header */}
            <div style={styles.cardHeader}>
              <h3 style={styles.title}>{job.title || 'Untitled Job'}</h3>
              <span style={styles.matchBadge}>
                🎯 {job.match_score || 0}% Match ({job.match_count || 0}/{job.total_skills || 0})
              </span>
              <span style={styles.statusBadge(job.status)}>
                {job.status || 'active'}
              </span>
            </div>

            {/* Company Name — FIXED */}
            <div style={styles.companyRow}>
              <span style={styles.companyIcon}>🏢</span>
              <span style={styles.companyName}>
                {job.company_name || 'Unknown Company'}
              </span>
            </div>

            {/* Meta Tags */}
            <div style={styles.tags}>
              <span style={styles.tag}>📍 {job.location || 'Not Specified'}</span>
              <span style={styles.tag}>💰 {formatSalary(job.salary)}</span>
              <span style={styles.tag}>📊 {formatCGPA(job.requirements)}</span>
              <span style={styles.tag}>📝 {formatBacklogs(job.requirements)}</span>
            </div>

            {/* Skills */}
            {job.skills_required && job.skills_required.length > 0 && (
              <div style={styles.skillsSection}>
                <p style={styles.label}>Required Skills:</p>
                <div style={styles.skills}>
                  {job.skills_required.map((skill, idx) => (
                    <span key={idx} style={styles.skill}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Branches */}
            {job.requirements?.branches && (
              <div style={styles.branches}>
                <p style={styles.label}>Branches:</p>
                <p>{Array.isArray(job.requirements.branches) 
                  ? job.requirements.branches.join(', ') 
                  : job.requirements.branches}</p>
              </div>
            )}

            {/* Description */}
            <p style={styles.description}>{job.description || 'No description available.'}</p>

            {/* Apply Button (Student only) */}
            {user?.role === 'student' && (
              <button 
                style={styles.applyBtn} 
                onClick={() => handleApply(job._id)}
              >
                🚀 Apply Now
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  container: { padding: '20px', maxWidth: '1200px', margin: '0 auto' },
  heading: { fontSize: '28px', marginBottom: '20px', color: '#1a1a2e' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' },
  card: { 
    background: 'white', 
    borderRadius: '12px', 
    padding: '20px', 
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    border: '1px solid #e0e0e0'
  },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' },
  title: { fontSize: '20px', fontWeight: 'bold', color: '#1a1a2e', margin: 0 },
  matchBadge: { background: '#ffe0e6', color: '#e94560', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' },
  statusBadge: (status) => ({ 
    background: status === 'active' ? '#d4edda' : '#f8d7da', 
    color: status === 'active' ? '#155724' : '#721c24',
    padding: '4px 10px', 
    borderRadius: '12px', 
    fontSize: '12px',
    textTransform: 'capitalize'
  }),
  companyRow: { display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' },
  companyIcon: { fontSize: '16px' },
  companyName: { fontSize: '15px', color: '#555', fontWeight: '500' },
  tags: { display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' },
  tag: { background: '#f0f0f5', padding: '4px 10px', borderRadius: '8px', fontSize: '13px', color: '#444' },
  skillsSection: { marginBottom: '10px' },
  label: { fontSize: '13px', color: '#888', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' },
  skills: { display: 'flex', flexWrap: 'wrap', gap: '6px' },
  skill: { background: '#e3f2fd', color: '#1565c0', padding: '3px 10px', borderRadius: '6px', fontSize: '12px' },
  branches: { marginBottom: '10px', fontSize: '13px', color: '#666' },
  description: { fontSize: '14px', color: '#555', lineHeight: '1.5', marginBottom: '15px' },
  applyBtn: { 
    width: '100%', 
    padding: '10px', 
    background: '#e94560', 
    color: 'white', 
    border: 'none', 
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: '600'
  },
  retryBtn: {
    marginTop: '15px',
    padding: '10px 20px',
    background: '#e94560',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer'
  },
  empty: { textAlign: 'center', padding: '50px', color: '#888', fontSize: '18px' }
};

export default Jobs;