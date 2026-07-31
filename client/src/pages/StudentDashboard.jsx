 import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

const InfoRow = ({ label, value }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f3f4f6', flexWrap: 'wrap', gap: '4px' }}>
    <span style={{ fontWeight: '600', color: '#4b5563', fontSize: '14px' }}>{label}</span>
    <span style={{ color: '#111827', fontSize: '14px', fontWeight: '500' }}>{value || '—'}</span>
  </div>
);

const StudentDashboard = () => {
  const { api, user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ cgpa: '', backlogs: '', skills: '', city: '' });
  const [refreshKey, setRefreshKey] = useState(0);
  const [resumeFile, setResumeFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [parseResult, setParseResult] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const fetchProfile = async () => {
      try {
        const res = await api.get('/students/profile');
        if (cancelled) return;
        const data = res.data.data || {};
        setProfile(data);
        setForm({
          cgpa: data.cgpa || '',
          backlogs: data.backlogs || '',
          skills: (data.skills || []).join(', '),
          city: data.city || ''
        });
      } catch (err) {
        console.error(err);
      }
    };
    fetchProfile();
    return () => { cancelled = true; };
  }, [api, refreshKey]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleUpdate = useCallback(async (e) => {
    e.preventDefault();
    try {
      await api.put('/students/profile', {
        cgpa: parseFloat(form.cgpa) || 0,
        backlogs: parseInt(form.backlogs, 10) || 0,
        skills: form.skills.split(',').map((s) => s.trim()).filter((s) => s),
        city: form.city
      });
      setEditMode(false);
      setRefreshKey((k) => k + 1);
      alert('✅ Profile updated!');
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    }
  }, [api, form]);

  const handleResumeUpload = useCallback(async () => {
    if (!resumeFile) return alert('Please select a file first');
    setUploading(true);
    setParseResult(null);
    try {
      const formData = new FormData();
      formData.append('resume', resumeFile);
      const res = await api.post('/students/resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setParseResult(res.data.data);
      setResumeFile(null);
      setRefreshKey((k) => k + 1);
      
      const msg = res.data.data.parse_warning
        ? `✅ Resume saved!\n⚠️ ${res.data.data.parse_warning}`
        : `✅ Resume parsed!\n🎯 Found ${res.data.data.extracted_skills?.length || 0} skills`;
      alert(msg);
    } catch (err) {
      alert(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  }, [api, resumeFile]);

  if (!profile) return (
    <div style={{ textAlign: 'center', marginTop: '100px', color: '#6b7280' }}>
      <div style={{ fontSize: '24px' }}>⏳</div>Loading...
    </div>
  );

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '16px', background: '#f3f4f6', minHeight: '100vh' }}>
      <h2 style={{ color: '#111827', marginBottom: '16px', fontSize: '22px', fontWeight: '700' }}>
        👋 Welcome, {user?.first_name}!
      </h2>

      {/* Profile Card */}
      <div style={{ background: '#ffffff', borderRadius: '12px', padding: '20px', marginBottom: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #e5e7eb' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
          <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '700', color: '#111827' }}>📋 My Profile</h3>
          {!editMode && (
            <button type="button" onClick={() => setEditMode(true)}
              style={{ padding: '8px 16px', background: '#1e3a8a', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
              ✏️ Edit
            </button>
          )}
        </div>

        {!editMode ? (
          <>
            <InfoRow label="Enrollment" value={profile.enrollment_number} />
            <InfoRow label="Branch" value={profile.branch} />
            <InfoRow label="CGPA" value={profile.cgpa} />
            <InfoRow label="Backlogs" value={profile.backlogs} />
            <InfoRow label="Graduation Year" value={profile.graduation_year} />
            <InfoRow label="City" value={profile.city} />
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f3f4f6', flexWrap: 'wrap', gap: '4px' }}>
              <span style={{ fontWeight: '600', color: '#4b5563', fontSize: '14px' }}>Placement Status</span>
              <span style={{
                color: profile.placement_status === 'placed' ? '#059669' : '#dc2626',
                fontWeight: '700', background: profile.placement_status === 'placed' ? '#d1fae5' : '#fee2e2',
                padding: '2px 10px', borderRadius: '6px', fontSize: '12px', textTransform: 'uppercase'
              }}>{profile.placement_status}</span>
            </div>
            {profile.resume_url && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', flexWrap: 'wrap', gap: '4px' }}>
                <span style={{ fontWeight: '600', color: '#4b5563', fontSize: '14px' }}>Resume</span>
                <a href={profile.resume_url} target="_blank" rel="noreferrer" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: '600', fontSize: '14px' }}>
                  📄 View Resume
                </a>
              </div>
            )}
          </>
        ) : (
          <form onSubmit={handleUpdate}>
            <div style={{ display: 'grid', gap: '10px' }}>
              <input style={inputStyle} type="number" step="0.1" name="cgpa" placeholder="CGPA" value={form.cgpa} onChange={handleChange} />
              <input style={inputStyle} type="number" name="backlogs" placeholder="Backlogs" value={form.backlogs} onChange={handleChange} />
              <input style={inputStyle} name="skills" placeholder="Skills (comma separated)" value={form.skills} onChange={handleChange} />
              <input style={inputStyle} name="city" placeholder="City" value={form.city} onChange={handleChange} />
              <div style={{ display: 'flex', gap: '10px', marginTop: '6px', flexWrap: 'wrap' }}>
                <button type="submit" style={{ ...btnStyle, background: '#1e3a8a' }}>💾 Save</button>
                <button type="button" style={{ ...btnStyle, background: '#6b7280' }} onClick={() => setEditMode(false)}>❌ Cancel</button>
              </div>
            </div>
          </form>
        )}
      </div>

      {/* Skills Card */}
      <div style={{ background: '#ffffff', borderRadius: '12px', padding: '20px', marginBottom: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #e5e7eb' }}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '17px', fontWeight: '700', color: '#111827' }}>
          🛠️ My Skills ({(profile.skills || []).length})
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {(profile.skills || []).map((skill, i) => (
            <span key={i} style={{ fontSize: '13px', background: '#eff6ff', color: '#1d4ed8', padding: '6px 12px', borderRadius: '6px', fontWeight: '500' }}>
              {skill}
            </span>
          ))}
          {(profile.skills || []).length === 0 && (
            <span style={{ color: '#9ca3af', fontSize: '13px' }}>No skills yet. Upload resume or add manually!</span>
          )}
        </div>
      </div>

      {/* Resume Upload */}
      <div style={{ background: '#ffffff', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #e5e7eb' }}>
        <h3 style={{ margin: '0 0 14px 0', fontSize: '17px', fontWeight: '700', color: '#111827' }}>📎 Upload Resume</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
          <input type="file" accept=".pdf,.doc,.docx"
            onChange={(e) => setResumeFile(e.target.files[0])}
            style={{ fontSize: '14px', color: '#4b5563', maxWidth: '100%' }} />
          <button type="button" onClick={handleResumeUpload} disabled={uploading || !resumeFile}
            style={{
              padding: '10px 20px', background: uploading ? '#9ca3af' : '#059669', color: '#ffffff',
              border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '600',
              cursor: uploading ? 'not-allowed' : 'pointer'
            }}>
            {uploading ? '⏳ Parsing...' : '⬆️ Upload & Parse'}
          </button>
        </div>

        {parseResult && (
          <div style={{
            marginTop: '14px', padding: '14px', background: parseResult.parse_warning ? '#fffbeb' : '#f0fdf4',
            borderRadius: '8px', border: parseResult.parse_warning ? '1px solid #fcd34d' : '1px solid #bbf7d0'
          }}>
            <div style={{ fontSize: '14px', fontWeight: '700', color: parseResult.parse_warning ? '#92400e' : '#065f46', marginBottom: '6px' }}>
              {parseResult.parse_warning ? '⚠️ ' + parseResult.parse_warning : `✅ Found ${parseResult.extracted_skills?.length} Skills:`}
            </div>
            {parseResult.extracted_skills?.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {parseResult.extracted_skills.map((s, i) => (
                  <span key={i} style={{ fontSize: '12px', background: '#dcfce7', color: '#166534', padding: '3px 8px', borderRadius: '4px', fontWeight: '500' }}>
                    {s}
                  </span>
                ))}
              </div>
            )}
            {parseResult.new_skills_added?.length > 0 && (
              <div style={{ marginTop: '8px', fontSize: '12px', color: '#059669' }}>
                🆕 Added {parseResult.new_skills_added.length} new skills to your profile!
              </div>
            )}
          </div>
        )}

        {profile.resume_url && (
          <p style={{ margin: '10px 0 0 0', fontSize: '13px', color: '#6b7280' }}>
            Current: <a href={profile.resume_url} target="_blank" rel="noreferrer" style={{ color: '#2563eb' }}>View Resume</a>
          </p>
        )}
      </div>
    </div>
  );
};

const inputStyle = {
  width: '100%', padding: '10px 12px', border: '1px solid #d1d5db',
  borderRadius: '8px', fontSize: '14px', color: '#111827', outline: 'none', boxSizing: 'border-box'
};

const btnStyle = {
  padding: '10px 20px', color: '#ffffff', border: 'none', borderRadius: '6px',
  fontSize: '13px', fontWeight: '600', cursor: 'pointer'
};

export default StudentDashboard;