import { useState, useEffect } from 'react';
import DashboardPage from './pages/DashboardPage';
import ToolsPage from './pages/ToolsPage';
import CustomersPage from './pages/CustomersPage';
import ProductsPage from './pages/ProductsPage';
import ProjectsPage from './pages/ProjectsPage';
import ReportsPage from './pages/ReportsPage';
import RateConfiguration from './components/RateConfiguration';
import ToolSettings from './components/ToolSettings';
import { initializeSampleData } from './utils/storage';
import './App.css';

function App() {
  const [activePage, setActivePage] = useState(() => {
    const hash = window.location.hash.slice(1) || 'dashboard';
    return hash;
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

  useEffect(() => {
    // Initialize sample data
    initializeSampleData();

    // Load rates from localStorage if available
    const savedRates = localStorage.getItem('windowRates');
    if (savedRates) {
      setRates(JSON.parse(savedRates));
    }

    // Handle hash changes for navigation
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1) || 'dashboard';
      setActivePage(hash);
      setIsMobileMenuOpen(false);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleRatesUpdate = (updatedRates) => {
    setRates(updatedRates);
  };

  const handlePageChange = (page) => {
    window.location.hash = page;
    setIsMobileMenuOpen(false);
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'tools', label: 'Tools', icon: '🛠️' },
    { id: 'customers', label: 'Customers', icon: '👥' },
    { id: 'products', label: 'Products', icon: '📦' },
    { id: 'quotations', label: 'Quotations', icon: '📄' },
    { id: 'invoices', label: 'Invoices', icon: '🧾' },
    { id: 'orders', label: 'Orders', icon: '📋' },
    { id: 'reports', label: 'Reports', icon: '📈' },
    { id: 'toolSettings', label: 'Tool Settings', icon: '🔧' },
    { id: 'rates', label: 'Rate Settings', icon: '⚙️' }
  ];

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
            {activePage === 'dashboard' && <DashboardPage />}
            {activePage === 'tools' && <ToolsPage rates={rates} />}
            {activePage === 'customers' && <CustomersPage />}
            {activePage === 'products' && <ProductsPage />}
            {activePage === 'quotations' && <ProjectsPage title="Quotations" icon="📄" feature="Quotation Management" />}
            {activePage === 'invoices' && <ProjectsPage title="Invoices" icon="🧾" feature="Invoice Management" />}
            {activePage === 'orders' && <ProjectsPage title="Orders" icon="📋" feature="Order Management" />}
            {activePage === 'reports' && <ReportsPage />}
            {activePage === 'toolSettings' && <ToolSettings />}
            {activePage === 'rates' && <RateConfiguration onRatesUpdate={handleRatesUpdate} />}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
