 import { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const Register = () => {
  const [form, setForm] = useState({
    email: '', password: '', role: 'student', first_name: '', last_name: '',
    enrollment_number: '', branch: 'Computer Science', graduation_year: 2025,
    company_name: '', company_type: 'MNC', industry: 'Information Technology'
  });
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setError('');
    try {
      const user = await register(form);
      if (!user || !user.role) {
        setError('Registration failed: Invalid response');
        return;
      }
      const role = user.role.toLowerCase();
      if (role === 'student') navigate('/student-dashboard', { replace: true });
      else if (role === 'company') navigate('/company-dashboard', { replace: true });
      else if (role === 'tpo') navigate('/tpo-dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed');
    }
  }, [form, register, navigate]);

  const inputStyle = {
    width: '100%', padding: '10px 12px', border: '1px solid #d1d5db',
    borderRadius: '8px', fontSize: '14px', color: '#111827', outline: 'none', background: '#ffffff'
  };

  const labelStyle = { display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '5px' };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '16px', background: '#f3f4f6'
    }}>
      <div style={{
        width: '100%', maxWidth: '480px', background: '#ffffff', padding: '28px',
        borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid #e5e7eb'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '36px', marginBottom: '6px' }}>📝</div>
          <h2 style={{ margin: 0, color: '#111827', fontSize: '22px', fontWeight: '700' }}>Create Account</h2>
          <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '14px' }}>Join Smart Placement today</p>
        </div>

        {error && (
          <div style={{
            background: '#fee2e2', color: '#991b1b', padding: '10px 14px',
            borderRadius: '8px', fontSize: '13px', marginBottom: '14px', fontWeight: '500'
          }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '12px' }}>
            <label style={labelStyle}>Role</label>
            <select name="role" value={form.role} onChange={handleChange} style={inputStyle}>
              <option value="student">Student</option>
              <option value="company">Company</option>
              <option value="tpo">TPO</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
            <div>
              <label style={labelStyle}>First Name</label>
              <input style={inputStyle} name="first_name" placeholder="First" value={form.first_name} onChange={handleChange} required />
            </div>
            <div>
              <label style={labelStyle}>Last Name</label>
              <input style={inputStyle} name="last_name" placeholder="Last" value={form.last_name} onChange={handleChange} required />
            </div>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={labelStyle}>Email</label>
            <input style={inputStyle} type="email" name="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required />
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={labelStyle}>Password</label>
            <input style={inputStyle} type="password" name="password" placeholder="••••••••" value={form.password} onChange={handleChange} required />
          </div>

          {form.role === 'student' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
              <div>
                <label style={labelStyle}>Enrollment No</label>
                <input style={inputStyle} name="enrollment_number" placeholder="e.g. 231B106" value={form.enrollment_number} onChange={handleChange} required />
              </div>
              <div>
                <label style={labelStyle}>Graduation Year</label>
                <input style={inputStyle} type="number" name="graduation_year" value={form.graduation_year} onChange={handleChange} required />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Branch</label>
                <select name="branch" value={form.branch} onChange={handleChange} style={inputStyle}>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Mechanical">Mechanical</option>
                  <option value="Civil">Civil</option>
                </select>
              </div>
            </div>
          )}

          {form.role === 'company' && (
            <div style={{ marginBottom: '12px' }}>
              <label style={labelStyle}>Company Name</label>
              <input style={inputStyle} name="company_name" placeholder="Company Name" value={form.company_name} onChange={handleChange} required />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
                <select name="company_type" value={form.company_type} onChange={handleChange} style={inputStyle}>
                  <option value="MNC">MNC</option>
                  <option value="Startup">Startup</option>
                  <option value="Product">Product</option>
                  <option value="Service">Service</option>
                </select>
                <input style={inputStyle} name="industry" placeholder="Industry" value={form.industry} onChange={handleChange} required />
              </div>
            </div>
          )}

          <button type="submit" style={{
            width: '100%', padding: '12px', background: '#1e3a8a', color: '#ffffff',
            border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', marginTop: '6px'
          }}>
            Register
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '14px', color: '#6b7280' }}>
          Already have account? <Link to="/login" style={{ color: '#2563eb', fontWeight: '600' }}>Login</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;