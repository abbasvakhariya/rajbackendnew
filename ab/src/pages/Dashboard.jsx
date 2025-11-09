import { useState, useEffect } from 'react';
import { Users, Package, FileText, Receipt, TrendingUp, DollarSign } from 'lucide-react';
import { 
  customerService, 
  productService, 
  quotationService, 
  invoiceService, 
  orderService,
  paymentService 
} from '../utils/storage';

function Dashboard() {
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
    const payments = paymentService.getAll();

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
      color: 'blue',
      bgGradient: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)'
    },
    { 
      title: 'Products', 
      value: stats.products, 
      icon: Package, 
      color: 'green',
      bgGradient: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)'
    },
    { 
      title: 'Quotations', 
      value: stats.quotations, 
      icon: FileText, 
      color: 'orange',
      bgGradient: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)'
    },
    { 
      title: 'Invoices', 
      value: stats.invoices, 
      icon: Receipt, 
      color: 'purple',
      bgGradient: 'linear-gradient(135deg, #9333ea 0%, #7e22ce 100%)'
    },
    { 
      title: 'Pending Orders', 
      value: stats.pendingOrders, 
      icon: TrendingUp, 
      color: 'red',
      bgGradient: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)'
    },
    { 
      title: 'Total Revenue', 
      value: `₹${stats.totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, 
      icon: DollarSign, 
      color: 'teal',
      bgGradient: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)'
    }
  ];

  return (
    <div className="container">
      <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '24px', color: '#111827' }}>
        Dashboard Overview
      </h1>

      {/* Stats Grid */}
      <div className="grid grid-3" style={{ marginBottom: '32px' }}>
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div 
              key={index}
              style={{
                background: stat.bgGradient,
                color: 'white',
                padding: '24px',
                borderRadius: '12px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>
                    {stat.title}
                  </p>
                  <h3 style={{ fontSize: '32px', fontWeight: 'bold' }}>
                    {stat.value}
                  </h3>
                </div>
                <div style={{
                  background: 'rgba(255,255,255,0.2)',
                  padding: '12px',
                  borderRadius: '12px'
                }}>
                  <Icon size={28} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-2">
        {/* Recent Invoices */}
        <div className="card">
          <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#111827' }}>
            Recent Invoices
          </h2>
          {stats.recentInvoices.length > 0 ? (
            <table className="table">
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentInvoices.map(invoice => (
                  <tr key={invoice.id}>
                    <td>{invoice.invoiceNumber}</td>
                    <td>{invoice.customerName}</td>
                    <td>₹{parseFloat(invoice.total || 0).toLocaleString('en-IN')}</td>
                    <td>{new Date(invoice.createdAt).toLocaleDateString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p style={{ textAlign: 'center', color: '#9ca3af', padding: '20px' }}>
              No invoices yet
            </p>
          )}
        </div>

        {/* Recent Quotations */}
        <div className="card">
          <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#111827' }}>
            Recent Quotations
          </h2>
          {stats.recentQuotations.length > 0 ? (
            <table className="table">
              <thead>
                <tr>
                  <th>Quote #</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentQuotations.map(quote => (
                  <tr key={quote.id}>
                    <td>{quote.quotationNumber}</td>
                    <td>{quote.customerName}</td>
                    <td>₹{parseFloat(quote.total || 0).toLocaleString('en-IN')}</td>
                    <td>{new Date(quote.createdAt).toLocaleDateString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p style={{ textAlign: 'center', color: '#9ca3af', padding: '20px' }}>
              No quotations yet
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;


