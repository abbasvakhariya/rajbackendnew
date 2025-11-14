import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import './AdminPanelEnhanced.css';

// Tab components
import DashboardTab from './admin/DashboardTab';
import UsersTab from './admin/UsersTab';
import SubscriptionsTab from './admin/SubscriptionsTab';
import PaymentsTab from './admin/PaymentsTab';
import AnalyticsTab from './admin/AnalyticsTab';
import SettingsTab from './admin/SettingsTab';
import ContentTab from './admin/ContentTab';
import NotificationsTab from './admin/NotificationsTab';
import SecurityTab from './admin/SecurityTab';
import SupportTab from './admin/SupportTab';
import DataTab from './admin/DataTab';
import AdvancedTab from './admin/AdvancedTab';

const AdminPanelEnhanced = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);

  // ONLY this email can access admin panel
  const ADMIN_EMAIL = 'abbasvakhariya00@gmail.com';

  useEffect(() => {
    // Check if user is the specific admin email
    if (!user || !user.email || user.email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      navigate('/dashboard');
      return;
    }
  }, [user, navigate]);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'users', label: 'Users', icon: '👥' },
    { id: 'subscriptions', label: 'Subscriptions', icon: '💳' },
    { id: 'payments', label: 'Payments', icon: '💰' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
    { id: 'content', label: 'Content', icon: '📦' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'security', label: 'Security', icon: '🔒' },
    { id: 'support', label: 'Support', icon: '🎧' },
    { id: 'data', label: 'Data', icon: '💾' },
    { id: 'advanced', label: 'Advanced', icon: '🚀' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardTab />;
      case 'users':
        return <UsersTab />;
      case 'subscriptions':
        return <SubscriptionsTab />;
      case 'payments':
        return <PaymentsTab />;
      case 'analytics':
        return <AnalyticsTab />;
      case 'settings':
        return <SettingsTab />;
      case 'content':
        return <ContentTab />;
      case 'notifications':
        return <NotificationsTab />;
      case 'security':
        return <SecurityTab />;
      case 'support':
        return <SupportTab />;
      case 'data':
        return <DataTab />;
      case 'advanced':
        return <AdvancedTab />;
      default:
        return <DashboardTab />;
    }
  };

  if (!user || !user.email || user.email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
    return null;
  }

  return (
    <div className="admin-panel-enhanced">
      {/* Header */}
      <header className="admin-header">
        <div className="admin-header-left">
          <h1>🔐 Admin Control Panel</h1>
          <span className="admin-badge">Super Admin</span>
        </div>
        <div className="admin-header-right">
          <div className="admin-user-info">
            <span className="admin-email">{user.email}</span>
          </div>
          <button 
            onClick={async () => {
              await logout();
              navigate('/login');
            }}
            className="admin-logout-btn"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Tabs Navigation */}
      <nav className="admin-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`admin-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* Tab Content */}
      <main className="admin-content">
        {loading ? (
          <div className="admin-loading">
            <div className="spinner"></div>
            <p>Loading...</p>
          </div>
        ) : (
          renderTabContent()
        )}
      </main>
    </div>
  );
};

export default AdminPanelEnhanced;

