 import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const PostJob = () => {
  const { api } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '', description: '', job_type: 'full_time', required_skills: '',
    min_cgpa: 7, max_backlogs: 0, eligible_branches: 'Computer Science, Information Technology',
    ctc_min: 800000, ctc_max: 1200000, location: '', application_deadline: ''
  });

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    try {
      await api.post('/jobs/', {
        ...form,
        required_skills: form.required_skills.split(',').map((s) => s.trim()).filter((s) => s),
        eligible_branches: form.eligible_branches.split(',').map((s) => s.trim()).filter((s) => s),
        status: 'active'
      });
      alert('✅ Job posted successfully!');
      navigate('/company-dashboard');
    } catch (err) {
      alert('❌ ' + (err.response?.data?.message || 'Failed to post job'));
    }
  }, [api, form, navigate]);

  const s = {
    container: { maxWidth: '600px', margin: '30px auto', padding: '20px' },
    input: { width: '100%', padding: '10px', margin: '8px 0', border: '1px solid #ddd', borderRadius: '5px' },
    btn: { width: '100%', padding: '12px', background: '#16213e', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '10px' }
  };

  return (
    <div style={s.container}>
      <h2>📝 Post New Job</h2>
      <form onSubmit={handleSubmit}>
        <input style={s.input} name="title" placeholder="Job Title" value={form.title} onChange={handleChange} required />
        <textarea style={s.input} name="description" placeholder="Description" rows="3" value={form.description} onChange={handleChange} required />
        
        <select style={s.input} name="job_type" value={form.job_type} onChange={handleChange}>
          <option value="full_time">Full Time</option>
          <option value="internship">Internship</option>
          <option value="contract">Contract</option>
        </select>

        <input style={s.input} name="required_skills" placeholder="Required Skills (comma separated)" value={form.required_skills} onChange={handleChange} required />
        <input style={s.input} type="number" step="0.1" name="min_cgpa" placeholder="Min CGPA" value={form.min_cgpa} onChange={handleChange} />
        <input style={s.input} type="number" name="max_backlogs" placeholder="Max Backlogs" value={form.max_backlogs} onChange={handleChange} />
        <input style={s.input} name="eligible_branches" placeholder="Eligible Branches (comma separated)" value={form.eligible_branches} onChange={handleChange} />
        <input style={s.input} type="number" name="ctc_min" placeholder="CTC Min" value={form.ctc_min} onChange={handleChange} />
        <input style={s.input} type="number" name="ctc_max" placeholder="CTC Max" value={form.ctc_max} onChange={handleChange} />
        <input style={s.input} name="location" placeholder="Location" value={form.location} onChange={handleChange} required />
        
        {/* 🔥 YE INPUT ADD KARO */}
        <label style={{ fontSize: '14px', color: '#555', marginTop: '5px', display: 'block' }}>Application Deadline:</label>
        <input 
          style={s.input} 
          type="date" 
          name="application_deadline" 
          value={form.application_deadline} 
          onChange={handleChange} 
          required 
        />

        <button type="submit" style={s.btn}>Post Job</button>
      </form>
    </div>
  );
};

export default PostJob;