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

  const s = {
    container: { maxWidth: '450px', margin: '50px auto', padding: '30px', boxShadow: '0 0 20px rgba(0,0,0,0.1)', borderRadius: '10px' },
    input: { width: '100%', padding: '10px', margin: '8px 0', border: '1px solid #ddd', borderRadius: '5px' },
    select: { width: '100%', padding: '10px', margin: '8px 0', border: '1px solid #ddd', borderRadius: '5px' },
    btn: { width: '100%', padding: '12px', background: '#16213e', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '10px' },
    error: { color: 'red', marginBottom: '10px' }
  };

  return (
    <div style={s.container}>
      <h2 style={{ textAlign: 'center' }}>📝 Register</h2>
      {error && <div style={s.error}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <select style={s.select} name="role" value={form.role} onChange={handleChange}>
          <option value="student">Student</option>
          <option value="company">Company</option>
          <option value="tpo">TPO</option>
        </select>
        <input style={s.input} name="first_name" placeholder="First Name" value={form.first_name} onChange={handleChange} required />
        <input style={s.input} name="last_name" placeholder="Last Name" value={form.last_name} onChange={handleChange} required />
        <input style={s.input} type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required />
        <input style={s.input} type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} required />

        {form.role === 'student' && (
          <>
            <input style={s.input} name="enrollment_number" placeholder="Enrollment Number" value={form.enrollment_number} onChange={handleChange} required />
            <select style={s.select} name="branch" value={form.branch} onChange={handleChange}>
              <option value="Computer Science">Computer Science</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Electronics">Electronics</option>
              <option value="Mechanical">Mechanical</option>
              <option value="Civil">Civil</option>
            </select>
            <input style={s.input} type="number" name="graduation_year" placeholder="Graduation Year" value={form.graduation_year} onChange={handleChange} required />
          </>
        )}

        {form.role === 'company' && (
          <>
            <input style={s.input} name="company_name" placeholder="Company Name" value={form.company_name} onChange={handleChange} required />
            <select style={s.select} name="company_type" value={form.company_type} onChange={handleChange}>
              <option value="MNC">MNC</option>
              <option value="Startup">Startup</option>
              <option value="Product">Product</option>
              <option value="Service">Service</option>
            </select>
            <input style={s.input} name="industry" placeholder="Industry" value={form.industry} onChange={handleChange} required />
          </>
        )}

        <button style={s.btn} type="submit">Register</button>
      </form>
      <div style={{ textAlign: 'center', marginTop: '15px' }}>Already have account? <Link to="/login">Login</Link></div>
    </div>
  );
};

export default Register;