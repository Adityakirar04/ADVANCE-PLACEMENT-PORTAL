 import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

const StudentDashboard = () => {
  const { api, user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ cgpa: '', backlogs: '', skills: '', city: '' });
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const fetchProfile = async () => {
      try {
        const res = await api.get('/students/profile');
        if (cancelled) return;
        setProfile(res.data.data);
        setForm({
          cgpa: res.data.data.cgpa || '',
          backlogs: res.data.data.backlogs || '',
          skills: (res.data.data.skills || []).join(', '),
          city: res.data.data.city || ''
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
        cgpa: parseFloat(form.cgpa),
        backlogs: parseInt(form.backlogs, 10),
        skills: form.skills.split(',').map((s) => s.trim()).filter((s) => s),
        city: form.city
      });
      setEditMode(false);
      setRefreshKey((k) => k + 1);
      alert('Profile updated!');
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    }
  }, [api, form]);

  const s = {
    container: { maxWidth: '800px', margin: '30px auto', padding: '20px' },
    card: { background: '#f8f9fa', padding: '25px', borderRadius: '10px', marginBottom: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' },
    row: { display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eee' },
    label: { fontWeight: 'bold', color: '#555' },
    btn: { background: '#16213e', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', marginTop: '10px' },
    input: { width: '100%', padding: '8px', margin: '5px 0', border: '1px solid #ddd', borderRadius: '4px' }
  };

  if (!profile) return <div style={{ textAlign: 'center', marginTop: '100px' }}>Loading...</div>;

  return (
    <div style={s.container}>
      <h2>👋 Welcome, {user?.first_name}!</h2>
      <div style={s.card}>
        <h3>📋 My Profile</h3>
        {!editMode ? (
          <>
            <div style={s.row}><span style={s.label}>Enrollment:</span> <span>{profile.enrollment_number}</span></div>
            <div style={s.row}><span style={s.label}>Branch:</span> <span>{profile.branch}</span></div>
            <div style={s.row}><span style={s.label}>CGPA:</span> <span>{profile.cgpa}</span></div>
            <div style={s.row}><span style={s.label}>Backlogs:</span> <span>{profile.backlogs}</span></div>
            <div style={s.row}><span style={s.label}>Graduation Year:</span> <span>{profile.graduation_year}</span></div>
            <div style={s.row}><span style={s.label}>Skills:</span> <span>{(profile.skills || []).join(', ') || 'None'}</span></div>
            <div style={s.row}><span style={s.label}>Placement Status:</span> <span>{profile.placement_status}</span></div>
            <button type="button" style={s.btn} onClick={() => setEditMode(true)}>Edit Profile</button>
          </>
        ) : (
          <form onSubmit={handleUpdate}>
            <input style={s.input} type="number" step="0.1" name="cgpa" placeholder="CGPA" value={form.cgpa} onChange={handleChange} />
            <input style={s.input} type="number" name="backlogs" placeholder="Backlogs" value={form.backlogs} onChange={handleChange} />
            <input style={s.input} name="skills" placeholder="Skills (comma separated)" value={form.skills} onChange={handleChange} />
            <input style={s.input} name="city" placeholder="City" value={form.city} onChange={handleChange} />
            <button type="submit" style={s.btn}>Save</button>
            <button type="button" style={{ ...s.btn, background: '#666', marginLeft: '10px' }} onClick={() => setEditMode(false)}>Cancel</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;