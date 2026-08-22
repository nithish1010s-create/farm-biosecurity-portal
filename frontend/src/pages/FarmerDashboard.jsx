// frontend/src/pages/FarmerDashboard.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyFarms, getComplianceScore, getAlerts } from '../services/api';
import ChecklistForm from '../components/farmer/ChecklistForm';

function FarmerDashboard() {
  const [farms, setFarms] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [compliance, setCompliance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showChecklist, setShowChecklist] = useState(false);
  const [selectedFarm, setSelectedFarm] = useState(null);
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
      const farmsRes = await getMyFarms();
      setFarms(farmsRes.data.farms || []);

      if (farmsRes.data.farms && farmsRes.data.farms.length > 0) {
        const farmId = farmsRes.data.farms[0].id;
        const complianceRes = await getComplianceScore(farmId);
        setCompliance(complianceRes.data);
      }

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

  const getScoreColor = (score) => {
    if (score >= 80) return '#4CAF50';
    if (score >= 60) return '#FF9800';
    return '#f44336';
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return '✅ Good';
    if (score >= 60) return '⚠️ Needs Attention';
    return '🚨 High Risk';
  };

  return (
    <div style={styles.container}>
      <div style={styles.statsContainer}>
        <div style={styles.statCard}>
          <h3>🏥 Health Score</h3>
          <p style={{...styles.statNumber, color: getScoreColor(compliance?.latest_score || 0)}}>
            {compliance?.latest_score || 0}%
          </p>
          <p style={styles.statLabel}>
            {getScoreLabel(compliance?.latest_score || 0)}
          </p>
        </div>
        <div style={styles.statCard}>
          <h3>🏠 My Farms</h3>
          <p style={styles.statNumber}>{farms.length}</p>
          <p style={styles.statLabel}>Total Farms</p>
        </div>
        <div style={styles.statCard}>
          <h3>🔔 Alerts</h3>
          <p style={styles.statNumber}>{alerts.length}</p>
          <p style={styles.statLabel}>New Alerts</p>
        </div>
        <div style={styles.statCard}>
          <h3>📋 Checklist</h3>
          <p style={styles.statNumber}>0</p>
          <p style={styles.statLabel}>Today's Tasks</p>
        </div>
      </div>

      {farms.length > 0 && (
        <button 
          onClick={() => {
            setSelectedFarm(farms[0].id);
            setShowChecklist(true);
          }}
          style={styles.checklistBtn}
        >
          📋 Submit Checklist
        </button>
      )}
      {farms.length === 0 && (
        <p style={styles.noFarmMsg}>⚠️ No farms registered. Contact admin to add a farm.</p>
      )}

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>🏠 My Farms</h2>
        {farms.length === 0 ? (
          <p style={styles.noData}>No farms registered yet. Contact admin to add a farm.</p>
        ) : (
          farms.map((farm) => (
            <div key={farm.id} style={styles.farmCard}>
              <div style={styles.farmInfo}>
                <strong style={styles.farmName}>{farm.name}</strong>
                <span style={styles.farmDetails}>
                  🐔 {farm.livestock_type} • {farm.livestock_count} animals
                </span>
                <span style={styles.farmDetails}>
                  📍 Latitude: {farm.latitude}, Longitude: {farm.longitude}
                </span>
              </div>
              <div style={styles.farmScore}>
                <span style={styles.scoreLabel}>Score</span>
                <span style={{...styles.scoreValue, color: getScoreColor(farm.biosecurity_score || 0)}}>
                  {farm.biosecurity_score || 0}%
                </span>
              </div>
            </div>
          ))
        )}
      </div>

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

      {showChecklist && selectedFarm && (
        <ChecklistForm
          farmId={selectedFarm}
          onClose={() => setShowChecklist(false)}
          onSubmit={() => {
            setShowChecklist(false);
            loadData();
          }}
        />
      )}
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
    marginBottom: '20px',
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
  statLabel: {
    fontSize: '14px',
    color: '#666',
  },
  checklistBtn: {
    padding: '14px 24px',
    backgroundColor: '#2E7D32',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '18px',
    cursor: 'pointer',
    marginBottom: '20px',
    width: '100%',
    fontWeight: 'bold',
  },
  noFarmMsg: {
    backgroundColor: '#fff3e0',
    color: '#e65100',
    padding: '15px',
    borderRadius: '8px',
    textAlign: 'center',
    marginBottom: '20px',
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

export default FarmerDashboard;