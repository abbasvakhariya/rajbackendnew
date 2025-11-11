import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import DashboardPage from './pages/DashboardPage';
import ToolsPage from './pages/ToolsPage';
import CustomersPage from './pages/CustomersPage';
import ProductsPage from './pages/ProductsPage';
import ProjectsPage from './pages/ProjectsPage';
import ReportsPage from './pages/ReportsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SubscriptionPage from './pages/SubscriptionPage';
import AdminPanel from './components/AdminPanel';
import AdminPanelEnhanced from './components/AdminPanelEnhanced';
import RateConfiguration from './components/RateConfiguration';
import ToolSettings from './components/ToolSettings';
import ProtectedRoute from './components/ProtectedRoute';
import { initializeSampleData } from './utils/storage';
import './App.css';

function App() {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState(() => {
    const path = location.pathname;
    if (path === '/') return 'dashboard';
    return path.slice(1) || 'dashboard';
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [rates, setRates] = useState({
    materialPerKg: 345,
    coatingPerKg: 60,
    glassPlane: 45,
    glassReflective: 75,
    lockPerTrack: 100,
    bearingPerUnit: 20,
    clampPerUnit: 20,
    glassRubberPerFeet: 8,
    woolfilePerFeet: 2,
    labourPerSqft: 50,
    fixedCharge: 30,
    mosquitoNetPerSqft: 20,
    brightBarPerUnit: 2.25,
    coverPerUnit: 1
  });

  // Initialize sample data once
  useEffect(() => {
    if (isAuthenticated) {
      initializeSampleData();
    }
  }, [isAuthenticated]);

  // Load rates once on mount
  useEffect(() => {
    const savedRates = localStorage.getItem('windowRates');
    if (savedRates) {
      setRates(JSON.parse(savedRates));
    }
  }, []);

  // Update active page based on route
  useEffect(() => {
    const path = location.pathname;
    if (path === '/') {
      setActivePage('dashboard');
    } else {
      setActivePage(path.slice(1));
    }
  }, [location.pathname]);

  const handleRatesUpdate = (updatedRates) => {
    setRates(updatedRates);
  };

  const handlePageChange = (page) => {
    navigate(`/${page}`);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // ONLY this email can see admin panel
  const ADMIN_EMAIL = 'abbasvakhariya00@gmail.com';
  const isAdminUser = user?.email && user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', path: '/dashboard' },
    { id: 'tools', label: 'Tools', icon: '🛠️', path: '/tools' },
    { id: 'customers', label: 'Customers', icon: '👥', path: '/customers' },
    { id: 'products', label: 'Products', icon: '📦', path: '/products' },
    { id: 'quotations', label: 'Quotations', icon: '📄', path: '/quotations' },
    { id: 'invoices', label: 'Invoices', icon: '🧾', path: '/invoices' },
    { id: 'orders', label: 'Orders', icon: '📋', path: '/orders' },
    { id: 'reports', label: 'Reports', icon: '📈', path: '/reports' },
    { id: 'toolSettings', label: 'Tool Settings', icon: '🔧', path: '/tool-settings' },
    { id: 'rates', label: 'Rate Settings', icon: '⚙️', path: '/rates' },
    // ONLY show admin panel to the specific email - subscription doesn't matter
    ...(isAdminUser ? [{ id: 'admin', label: 'Admin Panel', icon: '🔐', path: '/admin' }] : [])
  ];

  // Public routes (no authentication required)
  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // Authenticated routes
  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <div className="header-left">
          <button 
            className="mobile-menu-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
          <div className="app-logo">
            <span className="logo-icon">🪟</span>
            <span className="logo-text">Raj Windows</span>
          </div>
        </div>
        <div className="header-right">
          <div className="user-info">
            <span className="user-avatar">👤</span>
            <div className="user-details">
              <span className="user-name">{user?.fullName || 'User'}</span>
              <span className="user-email">{user?.email}</span>
            </div>
            <div className="user-menu">
              <button onClick={() => navigate('/subscription')} className="menu-item">
                Subscription
              </button>
              <button onClick={handleLogout} className="menu-item">
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="app-body">
        {/* Sidebar Navigation */}
        <aside className={`app-sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
          <nav className="sidebar-nav">
            {menuItems.map((item) => (
              <button
                key={item.id}
                className={`sidebar-item ${activePage === item.id ? 'active' : ''}`}
                onClick={() => handlePageChange(item.id)}
              >
                <span className="sidebar-icon">{item.icon}</span>
                <span className="sidebar-label">{item.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div 
            className="mobile-menu-overlay"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="app-main">
          <div className="page-container">
            <Routes>
              <Route path="/login" element={<Navigate to="/dashboard" replace />} />
              <Route path="/register" element={<Navigate to="/dashboard" replace />} />
              <Route path="/subscription" element={
                <ProtectedRoute>
                  <SubscriptionPage />
                </ProtectedRoute>
              } />
              <Route path="/admin" element={
                <ProtectedRoute>
                  <AdminPanelEnhanced />
                </ProtectedRoute>
              } />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } />
              <Route path="/tools" element={
                <ProtectedRoute>
                  <ToolsPage rates={rates} />
                </ProtectedRoute>
              } />
              <Route path="/customers" element={
                <ProtectedRoute>
                  <CustomersPage />
                </ProtectedRoute>
              } />
              <Route path="/products" element={
                <ProtectedRoute>
                  <ProductsPage />
                </ProtectedRoute>
              } />
              <Route path="/quotations" element={
                <ProtectedRoute>
                  <ProjectsPage title="Quotations" icon="📄" feature="Quotation Management" />
                </ProtectedRoute>
              } />
              <Route path="/invoices" element={
                <ProtectedRoute>
                  <ProjectsPage title="Invoices" icon="🧾" feature="Invoice Management" />
                </ProtectedRoute>
              } />
              <Route path="/orders" element={
                <ProtectedRoute>
                  <ProjectsPage title="Orders" icon="📋" feature="Order Management" />
                </ProtectedRoute>
              } />
              <Route path="/reports" element={
                <ProtectedRoute>
                  <ReportsPage />
                </ProtectedRoute>
              } />
              <Route path="/tool-settings" element={
                <ProtectedRoute>
                  <ToolSettings />
                </ProtectedRoute>
              } />
              <Route path="/rates" element={
                <ProtectedRoute>
                  <RateConfiguration onRatesUpdate={handleRatesUpdate} />
                </ProtectedRoute>
              } />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
