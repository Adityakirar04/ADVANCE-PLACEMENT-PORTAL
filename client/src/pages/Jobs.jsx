 import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

const Jobs = () => {
  const { api, user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [mySkills, setMySkills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      try {
        const [jobsRes, profileRes] = await Promise.all([
          api.get('/jobs/'),
          user?.role === 'student' ? api.get('/students/profile') : Promise.resolve({ data: { data: {} } })
        ]);
        if (!cancelled) {
          setJobs(jobsRes.data.data || []);
          const skills = profileRes.data.data?.skills || [];
          setMySkills(skills);
          console.log('🛠️ My skills loaded:', skills);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchData();
    return () => { cancelled = true; };
  }, [api, user]);

  const handleApply = useCallback(async (jobId) => {
    try {
      await api.post('/applications/apply', { job_id: jobId });
      alert('✅ Application submitted with resume!');
    } catch (err) {
      alert('❌ ' + (err.response?.data?.message || 'Apply failed'));
    }
  }, [api]);

  const getMatchScore = (jobSkills) => {
    if (!mySkills.length || !jobSkills?.length) return 0;
    const jobSkillsLower = jobSkills.map(s => s.toLowerCase());
    const mySkillsLower = mySkills.map(s => s.toLowerCase());
    const matched = jobSkillsLower.filter(js => 
      mySkillsLower.some(ms => ms.includes(js) || js.includes(ms))
    );
    return Math.round((matched.length / jobSkills.length) * 100);
  };

  if (loading) return (
    <div style={{ textAlign: 'center', marginTop: '100px', color: '#6b7280' }}>
      <div style={{ fontSize: '24px' }}>⏳</div>Loading jobs...
    </div>
  );

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '16px', background: '#f3f4f6', minHeight: '100vh' }}>
      <h2 style={{ color: '#111827', marginBottom: '16px', fontSize: '22px', fontWeight: '700' }}>
        💼 Available Jobs <span style={{ color: '#6b7280', fontSize: '15px' }}>({jobs.length})</span>
      </h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '14px'
      }}>
        {jobs.map((job) => {
          const matchScore = user?.role === 'student' ? getMatchScore(job.required_skills) : -1;
          const matchedCount = job.required_skills?.filter(js => 
            mySkills.some(ms => ms.toLowerCase().includes(js.toLowerCase()) || js.toLowerCase().includes(ms.toLowerCase()))
          ).length || 0;

          return (
            <div key={job._id} style={{
              background: '#ffffff', borderRadius: '12px', padding: '18px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #e5e7eb',
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
            }}>
              <div>
                {/* Header with Match Badge */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#111827', lineHeight: '1.3' }}>
                    {job.title}
                  </h3>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexShrink: 0 }}>
                    {user?.role === 'student' && (
                      <span style={{
                        fontSize: '11px', fontWeight: '700', padding: '4px 10px', borderRadius: '6px',
                        background: matchScore >= 70 ? '#d1fae5' : matchScore >= 40 ? '#fef3c7' : '#fee2e2',
                        color: matchScore >= 70 ? '#065f46' : matchScore >= 40 ? '#92400e' : '#991b1b',
                        whiteSpace: 'nowrap'
                      }}>
                        🎯 {matchScore}% Match ({matchedCount}/{job.required_skills?.length || 0})
                      </span>
                    )}
                    <span style={{
                      fontSize: '10px', fontWeight: '700',
                      color: job.status === 'active' ? '#059669' : '#dc2626',
                      background: job.status === 'active' ? '#d1fae5' : '#fee2e2',
                      padding: '3px 8px', borderRadius: '6px', whiteSpace: 'nowrap'
                    }}>
                      {job.status}
                    </span>
                  </div>
                </div>

                <p style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#6b7280', fontWeight: '500' }}>
                  🏢 {job.company_id?.company_name || 'Company'} • {job.company_id?.company_type || 'N/A'}
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
                  {[
                    { icon: '📍', text: job.location },
                    { icon: '💰', text: `₹${(job.ctc_min / 100000).toFixed(1)}L - ₹${(job.ctc_max / 100000).toFixed(1)}L` },
                    { icon: '📊', text: `CGPA ≥ ${job.min_cgpa}` },
                    { icon: '📚', text: `Backlogs ≤ ${job.max_backlogs}` }
                  ].map((tag, i) => (
                    <span key={i} style={{ fontSize: '12px', color: '#4b5563', background: '#f3f4f6', padding: '4px 10px', borderRadius: '6px' }}>
                      {tag.icon} {tag.text}
                    </span>
                  ))}
                </div>

                {/* Skills with Match Indicators */}
                <div style={{ marginBottom: '10px' }}>
                  <span style={{ fontSize: '11px', color: '#9ca3af', fontWeight: '600', textTransform: 'uppercase' }}>
                    Required Skills:
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                    {job.required_skills?.map((skill, i) => {
                      const hasSkill = mySkills.some(ms => 
                        ms.toLowerCase() === skill.toLowerCase() || 
                        ms.toLowerCase().includes(skill.toLowerCase()) ||
                        skill.toLowerCase().includes(ms.toLowerCase())
                      );
                      return (
                        <span key={i} style={{
                          fontSize: '11px',
                          background: hasSkill ? '#d1fae5' : '#eff6ff',
                          color: hasSkill ? '#065f46' : '#1d4ed8',
                          padding: '4px 10px', borderRadius: '4px', fontWeight: '600',
                          border: hasSkill ? '1px solid #86efac' : '1px solid #bfdbfe'
                        }}>
                          {hasSkill ? '✅ ' : '○ '}{skill}
                        </span>
                      );
                    })}
                  </div>
                </div>

                <div style={{ marginBottom: '10px' }}>
                  <span style={{ fontSize: '11px', color: '#9ca3af', fontWeight: '600', textTransform: 'uppercase' }}>
                    Branches:
                  </span>
                  <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#4b5563' }}>
                    {job.eligible_branches?.join(', ')}
                  </p>
                </div>

                <p style={{ margin: '0 0 12px 0', fontSize: '12px', color: '#6b7280', lineHeight: '1.5' }}>
                  {job.description}
                </p>
              </div>

              {user?.role === 'student' && (
                <button type="button" onClick={() => handleApply(job._id)} style={{
                  width: '100%', padding: '10px', background: '#1e3a8a', color: '#ffffff',
                  border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600',
                  cursor: 'pointer', marginTop: '4px'
                }}>
                  📝 Apply with Resume
                </button>
              )}
            </div>
          );
        })}
      </div>

      {jobs.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9ca3af' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>📭</div>
          <p>No jobs available right now.</p>
        </div>
      )}
    </div>
  );
};

export default Jobs;