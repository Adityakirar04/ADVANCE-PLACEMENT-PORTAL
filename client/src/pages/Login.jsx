 import { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setError('');
    try {
      const user = await login(form.email, form.password);
      if (!user || !user.role) {
        setError('Login failed: Invalid user data');
        return;
      }
      const role = user.role.toLowerCase();
      if (role === 'student') navigate('/student-dashboard', { replace: true });
      else if (role === 'company') navigate('/company-dashboard', { replace: true });
      else if (role === 'tpo') navigate('/tpo-dashboard', { replace: true });
      else setError('Unknown role: ' + user.role);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed');
    }
  }, [form.email, form.password, login, navigate]);

  const s = {
    container: { maxWidth: '400px', margin: '80px auto', padding: '30px', boxShadow: '0 0 20px rgba(0,0,0,0.1)', borderRadius: '10px' },
    input: { width: '100%', padding: '12px', margin: '10px 0', border: '1px solid #ddd', borderRadius: '5px', fontSize: '14px' },
    btn: { width: '100%', padding: '12px', background: '#16213e', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '16px', marginTop: '10px' },
    error: { color: 'red', marginBottom: '10px', fontSize: '14px' },
    link: { textAlign: 'center', marginTop: '15px', fontSize: '14px' }
  };

  return (
    <div style={s.container}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>🔐 Login</h2>
      {error && <div style={s.error}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <input style={s.input} type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required />
        <input style={s.input} type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} required />
        <button style={s.btn} type="submit">Login</button>
      </form>
      <div style={s.link}>New user? <Link to="/register">Register here</Link></div>
    </div>
  );
};

export default Login;