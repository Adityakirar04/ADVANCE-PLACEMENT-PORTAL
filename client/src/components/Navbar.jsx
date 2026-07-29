 import { useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = useCallback(() => {
    logout();
    navigate('/login');
  }, [logout, navigate]);

  const s = {
    navbar: { background: '#1a1a2e', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white' },
    logo: { fontSize: '22px', fontWeight: 'bold', color: '#e94560' },
    links: { display: 'flex', gap: '20px', alignItems: 'center' },
    link: { color: 'white', textDecoration: 'none', fontSize: '14px' },
    btn: { background: '#e94560', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '5px', cursor: 'pointer' }
  };

  return (
    <nav style={s.navbar}>
      <div style={s.logo}>🏫 Smart Placement</div>
      <div style={s.links}>
        {user ? (
          <>
            <span>👤 {user.first_name} ({user.role})</span>
            <Link to="/" style={s.link}>Dashboard</Link>
            {user.role === 'student' && <><Link to="/jobs" style={s.link}>Jobs</Link><Link to="/applications" style={s.link}>My Applications</Link></>}
            {user.role === 'company' && <><Link to="/jobs" style={s.link}>All Jobs</Link><Link to="/post-job" style={s.link}>Post Job</Link><Link to="/company-applications" style={s.link}>Applications</Link></>}
            {user.role === 'tpo' && <Link to="/tpo-dashboard" style={s.link}>Dashboard</Link>}
            <button type="button" style={s.btn} onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <><Link to="/login" style={s.link}>Login</Link><Link to="/register" style={s.link}>Register</Link></>
        )}
      </div>
    </nav>
  );
};

export default Navbar;