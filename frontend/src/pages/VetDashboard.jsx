// frontend/src/pages/VetDashboard.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllFarms, getAlerts } from '../services/api';

function VetDashboard() {
  const [user, setUser] = useState(null);
  const [farms, setFarms] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
      return;
    }
    setUser(JSON.parse(userData));
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const farmsRes = await getAllFarms();
      setFarms(farmsRes.data.farms || []);
      
      const alertsRes = await getAlerts();
      setAlerts(alertsRes.data.alerts || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) {
    return <div style={styles.loading}>Loading...</div>;
  }

  // Calculate risk counts
  const highRisk = farms.filter(f => (f.biosecurity_score || 0) < 60).length;
  const mediumRisk = farms.filter(f => (f.biosecurity_score || 0) >= 60 && (f.biosecurity_score || 0) < 80).length;
  const lowRisk = farms.filter(f => (f.biosecurity_score || 0) >= 80).length;

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>🐓 Farm Biosecurity Portal</h1>
        <div style={styles.headerRight}>
          <span style={styles.userName}>👨‍⚕️ Welcome, {user?.name || 'Vet'}!</span>
          <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={styles.statsContainer}>
        <div style={styles.statCard}>
          <h3>🏠 Total Farms</h3>
          <p style={styles.statNumber}>{farms.length}</p>
        </div>
        <div style={{...styles.statCard, borderLeft: '4px solid #f44336'}}>
          <h3>🔴 High Risk</h3>
          <p style={{...styles.statNumber, color: '#f44336'}}>{highRisk}</p>
        </div>
        <div style={{...styles.statCard, borderLeft: '4px solid #FF9800'}}>
          <h3>🟡 Medium Risk</h3>
          <p style={{...styles.statNumber, color: '#FF9800'}}>{mediumRisk}</p>
        </div>
        <div style={{...styles.statCard, borderLeft: '4px solid #4CAF50'}}>
          <h3>🟢 Low Risk</h3>
          <p style={{...styles.statNumber, color: '#4CAF50'}}>{lowRisk}</p>
        </div>
      </div>

      {/* All Farms Section */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>🏠 All Farms</h2>
        {farms.length === 0 ? (
          <p style={styles.noData}>No farms registered yet</p>
        ) : (
          farms.map((farm) => (
            <div key={farm.id} style={styles.farmCard}>
              <div style={styles.farmInfo}>
                <strong style={styles.farmName}>{farm.name}</strong>
                <span style={styles.farmDetails}>
                  🐔 {farm.livestock_type} • {farm.livestock_count} animals
                </span>
                <span style={styles.farmDetails}>
                  👨‍🌾 Farmer: {farm.farmer_name || 'Unknown'} • 📍 {farm.farmer_location || 'N/A'}
                </span>
              </div>
              <div style={styles.farmScore}>
                <span style={styles.scoreLabel}>Score</span>
                <span style={{
                  ...styles.scoreValue,
                  color: (farm.biosecurity_score || 0) >= 80 ? '#4CAF50' :
                         (farm.biosecurity_score || 0) >= 60 ? '#FF9800' : '#f44336'
                }}>
                  {farm.biosecurity_score || 0}%
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Alerts Section */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>🔔 Recent Alerts</h2>
        {alerts.length === 0 ? (
          <p style={styles.noData}>No alerts yet</p>
        ) : (
          alerts.slice(0, 5).map((alert) => (
            <div key={alert.id} style={styles.alertCard}>
              <span style={styles.alertSeverity(alert.severity)}>
                {alert.severity?.toUpperCase() || 'INFO'}
              </span>
              <div style={styles.alertContent}>
                <strong>{alert.title}</strong>
                <p style={styles.alertDesc}>{alert.description}</p>
                <small style={styles.alertDate}>
                  {new Date(alert.created_at).toLocaleDateString()}
                </small>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto',
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#f5f5f5',
    minHeight: '100vh',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px 20px',
    backgroundColor: '#2E7D32',
    color: 'white',
    borderRadius: '8px',
    marginBottom: '20px',
  },
  title: {
    margin: 0,
    fontSize: '24px',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },
  userName: {
    fontSize: '16px',
  },
  logoutBtn: {
    padding: '8px 16px',
    backgroundColor: '#c62828',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  statsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '30px',
  },
  statCard: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    textAlign: 'center',
  },
  statNumber: {
    fontSize: '36px',
    fontWeight: 'bold',
    margin: '10px 0 5px 0',
  },
  section: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    marginBottom: '20px',
  },
  sectionTitle: {
    marginTop: 0,
    marginBottom: '15px',
    color: '#333',
  },
  noData: {
    color: '#999',
    textAlign: 'center',
    padding: '20px',
  },
  farmCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px',
    borderBottom: '1px solid #eee',
  },
  farmInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  farmName: {
    fontSize: '18px',
    color: '#333',
  },
  farmDetails: {
    fontSize: '14px',
    color: '#666',
  },
  farmScore: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '10px 20px',
    backgroundColor: '#f5f5f5',
    borderRadius: '8px',
    minWidth: '80px',
  },
  scoreLabel: {
    fontSize: '12px',
    color: '#666',
  },
  scoreValue: {
    fontSize: '24px',
    fontWeight: 'bold',
  },
  alertCard: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '15px',
    padding: '12px',
    borderBottom: '1px solid #eee',
  },
  alertSeverity: (severity) => ({
    padding: '4px 10px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 'bold',
    backgroundColor: 
      severity === 'critical' ? '#c62828' :
      severity === 'high' ? '#d32f2f' :
      severity === 'medium' ? '#f57c00' : '#388e3c',
    color: 'white',
    minWidth: '60px',
    textAlign: 'center',
  }),
  alertContent: {
    flex: 1,
  },
  alertDesc: {
    margin: '5px 0',
    color: '#555',
  },
  alertDate: {
    color: '#999',
    fontSize: '12px',
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    fontSize: '20px',
    color: '#666',
  },
};

export default VetDashboard;