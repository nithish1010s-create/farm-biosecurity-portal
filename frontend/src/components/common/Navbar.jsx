// frontend/src/components/common/Navbar.jsx

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const getDashboardPath = () => {
    const role = user?.role;
    if (role === 'admin') return '/admin/dashboard';
    if (role === 'farmer') return '/farmer/dashboard';
    if (role === 'vet') return '/vet/dashboard';
    return '/login';
  };

  if (location.pathname === '/login' || location.pathname === '/register') {
    return null;
  }

  return (
    <nav style={styles.navbar}>
      <div style={styles.container}>
        <div style={styles.logo} onClick={() => navigate(getDashboardPath())}>
          🐓 Farm Portal
        </div>
        <div style={styles.links}>
          <button
            style={{
              ...styles.navLink,
              backgroundColor: location.pathname === getDashboardPath() ? '#388E3C' : 'transparent',
            }}
            onClick={() => navigate(getDashboardPath())}
          >
            📊 Dashboard
          </button>
          <button
            style={{
              ...styles.navLink,
              backgroundColor: location.pathname === '/profile' ? '#388E3C' : 'transparent',
            }}
            onClick={() => navigate('/profile')}
          >
            👤 Profile
          </button>
          <span style={styles.userBadge}>
            👋 {user?.name || 'User'}
          </span>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            🚪 Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

const styles = {
  navbar: {
    backgroundColor: '#1B5E20',
    padding: '12px 20px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    color: 'white',
    fontSize: '22px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  links: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  navLink: {
    padding: '8px 16px',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    backgroundColor: 'transparent',
  },
  userBadge: {
    color: 'white',
    padding: '8px 12px',
    backgroundColor: '#2E7D32',
    borderRadius: '20px',
    fontSize: '14px',
  },
  logoutBtn: {
    padding: '8px 16px',
    backgroundColor: '#c62828',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
};

export default Navbar;