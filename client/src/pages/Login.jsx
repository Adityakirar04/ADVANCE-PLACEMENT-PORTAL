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

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      background: '#f3f4f6'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        background: '#ffffff',
        padding: '32px',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        border: '1px solid #e5e7eb'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ fontSize: '40px', marginBottom: '8px' }}>🔐</div>
          <h2 style={{ margin: 0, color: '#111827', fontSize: '24px', fontWeight: '700' }}>Welcome Back</h2>
          <p style={{ margin: '6px 0 0 0', color: '#6b7280', fontSize: '14px' }}>Login to your Smart Placement account</p>
        </div>

        {error && (
          <div style={{
            background: '#fee2e2', color: '#991b1b', padding: '10px 14px',
            borderRadius: '8px', fontSize: '13px', marginBottom: '16px', fontWeight: '500'
          }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Email</label>
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
              style={{
                width: '100%', padding: '11px 14px', border: '1px solid #d1d5db',
                borderRadius: '8px', fontSize: '14px', color: '#111827', outline: 'none',
                background: '#ffffff', transition: 'border 0.2s'
              }}
              onFocus={(e) => e.target.style.border = '#2563eb'}
              onBlur={(e) => e.target.style.border = '#d1d5db'}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Password</label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
              style={{
                width: '100%', padding: '11px 14px', border: '1px solid #d1d5db',
                borderRadius: '8px', fontSize: '14px', color: '#111827', outline: 'none',
                background: '#ffffff'
              }}
            />
          </div>

          <button
            type="submit"
            style={{
              width: '100%', padding: '12px', background: '#1e3a8a', color: '#ffffff',
              border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '600',
              cursor: 'pointer', transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.background = '#1e40af'}
            onMouseLeave={(e) => e.target.style.background = '#1e3a8a'}
          >
            Login
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '18px', fontSize: '14px', color: '#6b7280' }}>
          New user? <Link to="/register" style={{ color: '#2563eb', fontWeight: '600' }}>Register here</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;