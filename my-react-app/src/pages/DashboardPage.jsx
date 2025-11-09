import { useState, useEffect } from 'react';
import { Users, Package, FileText, Receipt, TrendingUp, DollarSign, Wrench } from 'lucide-react';
import { 
  customerService, 
  productService, 
  quotationService, 
  invoiceService, 
  orderService,
  paymentService 
} from '../utils/storage';
import './DashboardPage.css';

const DashboardPage = () => {
  const [stats, setStats] = useState({
    customers: 0,
    products: 0,
    quotations: 0,
    invoices: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    recentInvoices: [],
    recentQuotations: []
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = () => {
    const customers = customerService.getAll();
    const products = productService.getAll();
    const quotations = quotationService.getAll();
    const invoices = invoiceService.getAll();
    const orders = orderService.getAll();

    const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'in-progress').length;
    
    const totalRevenue = invoices.reduce((sum, inv) => sum + (parseFloat(inv.total) || 0), 0);

    const recentInvoices = invoices
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    const recentQuotations = quotations
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    setStats({
      customers: customers.length,
      products: products.length,
      quotations: quotations.length,
      invoices: invoices.length,
      pendingOrders,
      totalRevenue,
      recentInvoices,
      recentQuotations
    });
  };

  const statCards = [
    { 
      title: 'Total Customers', 
      value: stats.customers, 
      icon: Users, 
      color: '#667eea',
      link: 'customers'
    },
    { 
      title: 'Products', 
      value: stats.products, 
      icon: Package, 
      color: '#16a34a',
      link: 'products'
    },
    { 
      title: 'Quotations', 
      value: stats.quotations, 
      icon: FileText, 
      color: '#f97316',
      link: 'quotations'
    },
    { 
      title: 'Invoices', 
      value: stats.invoices, 
      icon: Receipt, 
      color: '#9333ea',
      link: 'invoices'
    },
    { 
      title: 'Pending Orders', 
      value: stats.pendingOrders, 
      icon: TrendingUp, 
      color: '#dc2626',
      link: 'orders'
    },
    { 
      title: 'Total Revenue', 
      value: `₹${stats.totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, 
      icon: DollarSign, 
      color: '#0d9488',
      link: 'reports'
    }
  ];

  const quickActions = [
    { 
      title: 'Window Costing Tool', 
      desc: 'Calculate window costs instantly',
      icon: Wrench,
      link: 'tools',
      color: '#667eea'
    },
    { 
      title: 'Create Quotation', 
      desc: 'Generate new quotation for customer',
      icon: FileText,
      link: 'quotations',
      color: '#f97316'
    },
    { 
      title: 'Create Invoice', 
      desc: 'Create new invoice',
      icon: Receipt,
      link: 'invoices',
      color: '#9333ea'
    },
    { 
      title: 'Manage Customers', 
      desc: 'View and manage customer list',
      icon: Users,
      link: 'customers',
      color: '#667eea'
    }
  ];

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>Dashboard Overview</h1>
        <p>Welcome back! Here's what's happening with your business today.</p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div 
              key={index}
              className="stat-card"
              style={{ borderLeftColor: stat.color }}
              onClick={() => window.location.hash = stat.link}
            >
              <div className="stat-icon" style={{ backgroundColor: `${stat.color}20`, color: stat.color }}>
                <Icon size={28} />
              </div>
              <div className="stat-content">
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.title}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-section">
        <h2>Quick Actions</h2>
        <div className="quick-actions-grid">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <div 
                key={index} 
                className="quick-action-card"
                onClick={() => window.location.hash = action.link}
              >
                <div className="action-icon" style={{ backgroundColor: action.color }}>
                  <Icon size={24} color="white" />
                </div>
                <div className="action-content">
                  <h3>{action.title}</h3>
                  <p>{action.desc}</p>
                </div>
                <div className="action-arrow" style={{ color: action.color }}>→</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="recent-activity-grid">
        {/* Recent Invoices */}
        <div className="activity-card">
          <h2>Recent Invoices</h2>
          {stats.recentInvoices.length > 0 ? (
            <div className="activity-list">
              {stats.recentInvoices.map(invoice => (
                <div key={invoice.id} className="activity-item">
                  <div className="activity-info">
                    <span className="activity-title">{invoice.invoiceNumber}</span>
                    <span className="activity-subtitle">{invoice.customerName}</span>
                  </div>
                  <div className="activity-value">₹{parseFloat(invoice.total || 0).toLocaleString('en-IN')}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">No invoices yet</p>
          )}
        </div>

        {/* Recent Quotations */}
        <div className="activity-card">
          <h2>Recent Quotations</h2>
          {stats.recentQuotations.length > 0 ? (
            <div className="activity-list">
              {stats.recentQuotations.map(quote => (
                <div key={quote.id} className="activity-item">
                  <div className="activity-info">
                    <span className="activity-title">{quote.quotationNumber}</span>
                    <span className="activity-subtitle">{quote.customerName}</span>
                  </div>
                  <div className="activity-value">₹{parseFloat(quote.total || 0).toLocaleString('en-IN')}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">No quotations yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;


