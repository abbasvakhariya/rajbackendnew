import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  Home, Users, Package, FileText, Receipt, 
  ShoppingCart, CreditCard, BarChart3, Settings as SettingsIcon,
  Menu, X 
} from 'lucide-react';

// Import pages
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Products from './pages/Products';
import Quotations from './pages/Quotations';
import Invoices from './pages/Invoices';
import Orders from './pages/Orders';
import Payments from './pages/Payments';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

// Initialize sample data
import { initializeSampleData } from './utils/storage';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    // Initialize sample data on first load
    initializeSampleData();
  }, []);

  return (
    <Router>
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar isOpen={sidebarOpen} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
          <main style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/products" element={<Products />} />
              <Route path="/quotations" element={<Quotations />} />
              <Route path="/invoices" element={<Invoices />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/payments" element={<Payments />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

function Header({ toggleSidebar }) {
  return (
    <header style={{
      background: 'white',
      padding: '16px 24px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button onClick={toggleSidebar} className="icon-btn">
          <Menu size={24} />
        </button>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>
          Babji Glass - Fabrication Management
        </h1>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontSize: '14px', color: '#6b7280' }}>
          {new Date().toLocaleDateString('en-IN', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </span>
      </div>
    </header>
  );
}

function Sidebar({ isOpen }) {
  const location = useLocation();

  const menuItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/customers', icon: Users, label: 'Customers' },
    { path: '/products', icon: Package, label: 'Products' },
    { path: '/quotations', icon: FileText, label: 'Quotations' },
    { path: '/invoices', icon: Receipt, label: 'Invoices' },
    { path: '/orders', icon: ShoppingCart, label: 'Orders' },
    { path: '/payments', icon: CreditCard, label: 'Payments' },
    { path: '/reports', icon: BarChart3, label: 'Reports' },
    { path: '/settings', icon: SettingsIcon, label: 'Settings' }
  ];

  if (!isOpen) return null;

  return (
    <aside style={{
      width: '260px',
      background: 'linear-gradient(180deg, #1e3a8a 0%, #1e40af 100%)',
      color: 'white',
      padding: '20px 0',
      boxShadow: '2px 0 8px rgba(0,0,0,0.1)'
    }}>
      <div style={{ padding: '0 20px 30px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '4px' }}>
          🏢 Babji Glass
        </h2>
        <p style={{ fontSize: '12px', opacity: 0.8 }}>Fabrication Management</p>
      </div>
      
      <nav style={{ marginTop: '20px' }}>
        {menuItems.map(item => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '14px 20px',
                color: 'white',
                textDecoration: 'none',
                background: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
                borderLeft: isActive ? '4px solid white' : '4px solid transparent',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.background = 'transparent';
              }}
            >
              <Icon size={20} />
              <span style={{ fontSize: '15px', fontWeight: isActive ? '600' : '400' }}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

export default App;


