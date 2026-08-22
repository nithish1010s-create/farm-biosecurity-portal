// frontend/src/pages/Profile.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

function Profile() {
  const [user, setUser] = useState(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
      return;
    }
    const parsed = JSON.parse(userData);
    setUser(parsed);
    setName(parsed.name || '');
    setPhone(parsed.phone || '');
    setLocation(parsed.location || '');
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const res = await API.put('/auth/profile', {
        name,
        phone,
        location
      });

      const updatedUser = { ...user, ...res.data.user };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);

      setMessage('Profile updated successfully! ✅');
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed ❌');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div style={styles.loading}>Loading...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>👤 Edit Profile</h2>
        <p style={styles.cardSubtitle}>
          <strong>Email:</strong> {user?.email} (cannot be changed)
        </p>

        {message && <div style={styles.success}>{message}</div>}
        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={styles.input}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Phone Number</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={styles.input}
              placeholder="Enter your phone number"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              style={styles.input}
              placeholder="Enter your location"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Role</label>
            <input
              type="text"
              value={user?.role || ''}
              style={{ ...styles.input, backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
              disabled
            />
          </div>

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? 'Saving...' : '💾 Save Changes'}
          </button>
        </form>

        <div style={styles.infoBox}>
          <p>💡 <strong>Note:</strong> Email cannot be changed. Contact admin for email updates.</p>
          <p style={{ marginTop: '5px', fontSize: '13px' }}>
            📅 Joined: {new Date(user?.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '40px 20px',
    maxWidth: '600px',
    margin: '0 auto',
    fontFamily: 'Arial, sans-serif',
    minHeight: '80vh',
  },
  card: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
  },
  cardTitle: {
    marginTop: 0,
    marginBottom: '5px',
    color: '#2E7D32',
    fontSize: '28px',
  },
  cardSubtitle: {
    color: '#666',
    marginBottom: '20px',
    paddingBottom: '15px',
    borderBottom: '1px solid #eee',
    fontSize: '14px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    fontWeight: 'bold',
    marginBottom: '5px',
    color: '#333',
    fontSize: '14px',
  },
  input: {
    padding: '12px 14px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '16px',
    outline: 'none',
  },
  button: {
    padding: '14px',
    backgroundColor: '#2E7D32',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '10px',
  },
  success: {
    backgroundColor: '#e8f5e9',
    color: '#2E7D32',
    padding: '12px 16px',
    borderRadius: '6px',
    marginBottom: '15px',
    border: '1px solid #a5d6a7',
  },
  error: {
    backgroundColor: '#ffebee',
    color: '#c62828',
    padding: '12px 16px',
    borderRadius: '6px',
    marginBottom: '15px',
    border: '1px solid #ef9a9a',
  },
  infoBox: {
    marginTop: '20px',
    padding: '15px',
    backgroundColor: '#fff3e0',
    borderRadius: '6px',
    color: '#e65100',
    fontSize: '14px',
    border: '1px solid #ffe0b2',
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '60vh',
    fontSize: '18px',
    color: '#666',
  },
};

export default Profile;