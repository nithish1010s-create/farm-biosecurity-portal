// frontend/src/pages/AdminDashboard.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAlerts, getAllFarms } from '../services/api';

function AdminDashboard() {
  const [alerts, setAlerts] = useState([]);
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
      return;
    }
    loadData();
  }, [navigate]);

  const loadData = async () => {
    try {
      const alertsRes = await getAlerts();
      setAlerts(alertsRes.data.alerts || []);
      const farmsRes = await getAllFarms();
      setFarms(farmsRes.data.farms || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={styles.loading}>Loading...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.statsContainer}>
        <div style={styles.statCard}>
          <h3>Total Farms</h3>
          <p style={styles.statNumber}>{farms.length}</p>
        </div>
        <div style={styles.statCard}>
          <h3>Total Alerts</h3>
          <p style={styles.statNumber}>{alerts.length}</p>
        </div>
        <div style={styles.statCard}>
          <h3>Active Users</h3>
          <p style={styles.statNumber}>4</p>
        </div>
        <div style={styles.statCard}>
          <h3>Compliance Rate</h3>
          <p style={styles.statNumber}>78%</p>
        </div>
      </div>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>🔔 Recent Alerts</h2>
        {alerts.length === 0 ? (
          <p style={styles.noData}>No alerts yet</p>
        ) : (
          alerts.slice(0, 5).map((alert) => (
            <div key={alert.id} style={styles.alertCard}>
              <span style={styles.alertSeverity(alert.severity)}>
                {alert.severity?.toUpperCase()}
              </span>
              <div style={styles.alertContent}>
                <strong>{alert.title}</strong>
                <p>{alert.description}</p>
                <small>{new Date(alert.created_at).toLocaleDateString()}</small>
              </div>
            </div>
          ))
        )}
      </div>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>🏠 Recent Farms</h2>
        {farms.length === 0 ? (
          <p style={styles.noData}>No farms registered yet</p>
        ) : (
          farms.slice(0, 5).map((farm) => (
            <div key={farm.id} style={styles.farmCard}>
              <div style={styles.farmInfo}>
                <strong>{farm.name}</strong>
                <span>🐔 {farm.livestock_type} • {farm.livestock_count} animals</span>
                <small>Farmer: {farm.farmer_name || 'Unknown'}</small>
              </div>
              <div style={styles.farmScore}>
                Score: {farm.biosecurity_score || 0}%
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
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#2E7D32',
    margin: '10px 0 0 0',
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
  farmCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px',
    borderBottom: '1px solid #eee',
  },
  farmInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  farmScore: {
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  noData: {
    color: '#999',
    textAlign: 'center',
    padding: '20px',
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

export default AdminDashboard;