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
    navbar: {
      background: '#1a1a2e',
      padding: '15px 30px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      color: 'white',
      flexWrap: 'wrap',
      gap: '10px'
    },
    logo: {
      fontSize: '22px',
      fontWeight: 'bold',
      color: '#e94560',
      whiteSpace: 'nowrap'
    },
    links: {
      display: 'flex',
      gap: '16px',
      alignItems: 'center',
      flexWrap: 'wrap'
    },
    link: {
      color: 'white',
      textDecoration: 'none',
      fontSize: '14px',
      whiteSpace: 'nowrap',
      padding: '4px 0',
      borderBottom: '2px solid transparent',
      transition: 'all 0.2s'
    },
    btn: {
      background: '#e94560',
      color: 'white',
      border: 'none',
      padding: '8px 16px',
      borderRadius: '5px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '600',
      whiteSpace: 'nowrap'
    },
    userBadge: {
      fontSize: '13px',
      color: '#a0a0b0',
      marginRight: '8px',
      whiteSpace: 'nowrap'
    }
  };

  return (
    <nav style={s.navbar}>
      <div style={s.logo}>🏫 Smart Placement</div>

      <div style={s.links}>
        {user ? (
          <>
            <span style={s.userBadge}>👤 {user.first_name} ({user.role})</span>

            <Link to="/" style={s.link}>Dashboard</Link>

            {user.role === 'student' && (
              <>
                <Link to="/jobs" style={s.link}>Jobs</Link>
                <Link to="/applications" style={s.link}>My Applications</Link>
                <Link to="/resume-analyzer" style={s.link}>🤖 AI Analyzer</Link>
                <Link to="/interview-prep" style={s.link}>🎯 Interview Prep</Link>
                <Link to="/ai-chat" style={s.link}>💬 AI Chat</Link>
              </>
            )}

            {user.role === 'company' && (
              <>
                <Link to="/jobs" style={s.link}>All Jobs</Link>
                <Link to="/post-job" style={s.link}>Post Job</Link>
                <Link to="/company-applications" style={s.link}>Applications</Link>
              </>
            )}

            {user.role === 'tpo' && (
              <Link to="/tpo-dashboard" style={s.link}>Dashboard</Link>
            )}

            <button type="button" style={s.btn} onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={s.link}>Login</Link>
            <Link to="/register" style={s.link}>Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;