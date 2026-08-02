 import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const Login = () => {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ 
    first_name: '', last_name: '', email: '', password: '', role: 'student' 
  });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setAlert(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAlert(null);

    try {
      if (isRegister) {
        // ==================== REGISTER ====================
        const res = await register(form);
        
        // 🔥 FIX: Response check karo pehle
        if (!res) {
          throw new Error('No response from server');
        }
        
        // Agar backend ne success: false bheja
        if (res.success === false) {
          throw new Error(res.message || 'Registration failed');
        }
        
        // Agar success: true aaya
        if (res.success === true) {
          if (form.role === 'tpo') {
            // TPO → Auto login
            const loginRes = await login(form.email, form.password);
            if (loginRes?.success) {
              navigate('/tpo-dashboard');
            } else {
              throw new Error(loginRes?.message || 'Auto-login failed');
            }
          } else {
            // Student/Company → Success message
            setAlert({ 
              type: 'success', 
              message: '✅ Registered! Please wait for TPO approval before logging in.' 
            });
            setIsRegister(false);
            setForm(prev => ({ ...prev, password: '' }));
          }
        } else {
          // success field hi nahi hai response mein
          throw new Error('Invalid response from server');
        }
        
      } else {
        // ==================== LOGIN ====================
        const res = await login(form.email, form.password);
        
        if (!res) {
          throw new Error('No response from server');
        }
        
        if (res.success === true && res.user) {
          if (res.user.role === 'student') navigate('/student-dashboard');
          else if (res.user.role === 'company') navigate('/company-dashboard');
          else if (res.user.role === 'tpo') navigate('/tpo-dashboard');
        } else {
          // Backend ne error bheja — approvalStatus check karo
          if (res.approvalStatus === 'pending') {
            setAlert({ type: 'pending', message: '⏳ ' + (res.message || 'Account pending approval') });
          } else if (res.approvalStatus === 'rejected') {
            setAlert({ type: 'rejected', message: '❌ ' + (res.message || 'Account rejected') });
          } else {
            throw new Error(res.message || 'Login failed');
          }
        }
      }
    } catch (err) {
      console.error('Auth error:', err);
      
      // 🔥 FIX: Axios error ya normal error — dono handle karo
      const errMsg = err.response?.data?.message || err.message || 'Something went wrong';
      setAlert({ type: 'error', message: errMsg });
    } finally {
      setLoading(false);
    }
  };

  const alertStyles = {
    success: { bg: '#d1fae5', border: '#86efac', color: '#166534' },
    pending: { bg: '#fef3c7', border: '#fcd34d', color: '#92400e' },
    rejected: { bg: '#fee2e2', border: '#fca5a5', color: '#991b1b' },
    error: { bg: '#fee2e2', border: '#fca5a5', color: '#991b1b' }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', padding: '20px'
    }}>
      <div style={{
        background: '#ffffff', borderRadius: '16px', padding: '40px', width: '100%', maxWidth: '440px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        <h2 style={{ textAlign: 'center', color: '#111827', marginBottom: '4px', fontSize: '26px' }}>
          {isRegister ? 'Create Account' : 'Welcome Back'}
        </h2>
        <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '14px', marginBottom: '24px' }}>
          {isRegister ? 'Join Smart Placement Portal' : 'Login to Smart Placement Portal'}
        </p>

        {alert && (
          <div style={{
            background: alertStyles[alert.type].bg,
            border: `1px solid ${alertStyles[alert.type].border}`,
            color: alertStyles[alert.type].color,
            padding: '12px 16px', borderRadius: '10px', fontSize: '13px',
            marginBottom: '20px', lineHeight: '1.5', fontWeight: '500'
          }}>
            {alert.message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                I am a
              </label>
              <select name="role" value={form.role} onChange={handleChange}
                style={{ width: '100%', padding: '12px 14px', border: '1px solid #d1d5db',
                  borderRadius: '10px', fontSize: '14px', outline: 'none', background: '#fff' }}>
                <option value="student">Student</option>
                <option value="company">Company</option>
                <option value="tpo">TPO (Admin)</option>
              </select>
            </div>
          )}

          {isRegister && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                  First Name
                </label>
                <input type="text" name="first_name" value={form.first_name} onChange={handleChange} required
                  style={{ width: '100%', padding: '12px 14px', border: '1px solid #d1d5db',
                    borderRadius: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                  Last Name
                </label>
                <input type="text" name="last_name" value={form.last_name} onChange={handleChange} required
                  style={{ width: '100%', padding: '12px 14px', border: '1px solid #d1d5db',
                    borderRadius: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
              </div>
            </div>
          )}

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
              Email
            </label>
            <input type="email" name="email" value={form.email} onChange={handleChange} required
              style={{ width: '100%', padding: '12px 14px', border: '1px solid #d1d5db',
                borderRadius: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
              placeholder="you@example.com" />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
              Password
            </label>
            <input type="password" name="password" value={form.password} onChange={handleChange} required
              style={{ width: '100%', padding: '12px 14px', border: '1px solid #d1d5db',
                borderRadius: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
              placeholder="Min 6 characters" />
          </div>

          <button type="submit" disabled={loading}
            style={{
              width: '100%', padding: '12px', background: loading ? '#9ca3af' : '#1e3a8a',
              color: '#ffffff', border: 'none', borderRadius: '10px',
              fontSize: '15px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer'
            }}>
            {loading ? 'Please wait...' : (isRegister ? 'Create Account' : 'Login')}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: '#6b7280' }}>
          {isRegister ? 'Already have an account? ' : "Don't have an account? "}
          <button type="button" onClick={() => { setIsRegister(!isRegister); setAlert(null); }}
            style={{ color: '#1e3a8a', background: 'none', border: 'none', fontWeight: '600', cursor: 'pointer', fontSize: '13px' }}>
            {isRegister ? 'Login here' : 'Register here'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;