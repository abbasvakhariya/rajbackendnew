import { useState, useEffect } from 'react';
import { adminAPI } from '../../utils/api';
import './AdminTabs.css';

const DashboardTab = () => {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getStats();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount || 0);
  };

  if (loading) {
    return <div className="tab-loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard-tab">
      <div className="tab-header">
        <h2>Dashboard Overview</h2>
        <p className="tab-subtitle">Real-time statistics and insights</p>
      </div>

      {/* Quick Stats */}
      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <h3>Total Users</h3>
            <p className="stat-value">{stats.totalUsers || 0}</p>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <h3>Active Users</h3>
            <p className="stat-value">{stats.activeUsers || 0}</p>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon">⏳</div>
          <div className="stat-info">
            <h3>Trial Users</h3>
            <p className="stat-value">{stats.trialUsers || 0}</p>
          </div>
        </div>

        <div className="stat-card danger">
          <div className="stat-icon">❌</div>
          <div className="stat-info">
            <h3>Expired Users</h3>
            <p className="stat-value">{stats.expiredUsers || 0}</p>
          </div>
        </div>

        <div className="stat-card info">
          <div className="stat-icon">🪟</div>
          <div className="stat-info">
            <h3>Total Windows</h3>
            <p className="stat-value">{stats.totalWindows || 0}</p>
          </div>
        </div>

        <div className="stat-card revenue">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <h3>Total Revenue</h3>
            <p className="stat-value">{formatCurrency(stats.totalRevenue)}</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="actions-grid">
          <button className="action-btn">
            <span className="action-icon">➕</span>
            <span>Add User</span>
          </button>
          <button className="action-btn">
            <span className="action-icon">📧</span>
            <span>Send Notification</span>
          </button>
          <button className="action-btn">
            <span className="action-icon">📊</span>
            <span>View Reports</span>
          </button>
          <button className="action-btn">
            <span className="action-icon">⚙️</span>
            <span>System Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardTab;

