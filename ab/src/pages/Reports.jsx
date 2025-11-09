import { useState, useEffect } from 'react';
import { Download, Calendar, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { 
  invoiceService, 
  paymentService, 
  orderService, 
  customerService,
  productService,
  quotationService 
} from '../utils/storage';

function Reports() {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  const [reportData, setReportData] = useState({
    totalSales: 0,
    totalPayments: 0,
    totalOrders: 0,
    totalCustomers: 0,
    pendingPayments: 0,
    topCustomers: [],
    topProducts: [],
    salesByMonth: [],
    recentInvoices: []
  });

  useEffect(() => {
    generateReport();
  }, [dateRange]);

  const generateReport = () => {
    const invoices = invoiceService.getAll();
    const payments = paymentService.getAll();
    const orders = orderService.getAll();
    const customers = customerService.getAll();
    const products = productService.getAll();

    // Filter by date range
    const startDate = new Date(dateRange.startDate);
    const endDate = new Date(dateRange.endDate);
    endDate.setHours(23, 59, 59, 999);

    const filteredInvoices = invoices.filter(inv => {
      const invDate = new Date(inv.createdAt);
      return invDate >= startDate && invDate <= endDate;
    });

    const filteredPayments = payments.filter(pay => {
      const payDate = new Date(pay.paymentDate);
      return payDate >= startDate && payDate <= endDate;
    });

    // Calculate totals
    const totalSales = filteredInvoices.reduce((sum, inv) => sum + parseFloat(inv.total || 0), 0);
    const totalPayments = filteredPayments.reduce((sum, pay) => sum + parseFloat(pay.amount || 0), 0);
    const pendingPayments = totalSales - totalPayments;

    // Top customers
    const customerSales = {};
    filteredInvoices.forEach(inv => {
      if (!customerSales[inv.customerId]) {
        customerSales[inv.customerId] = {
          name: inv.customerName,
          total: 0,
          count: 0
        };
      }
      customerSales[inv.customerId].total += parseFloat(inv.total || 0);
      customerSales[inv.customerId].count += 1;
    });

    const topCustomers = Object.values(customerSales)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    // Top products
    const productSales = {};
    filteredInvoices.forEach(inv => {
      inv.items?.forEach(item => {
        if (!productSales[item.productId || item.productName]) {
          productSales[item.productId || item.productName] = {
            name: item.productName,
            quantity: 0,
            total: 0
          };
        }
        productSales[item.productId || item.productName].quantity += parseFloat(item.quantity || 0);
        productSales[item.productId || item.productName].total += parseFloat(item.total || 0);
      });
    });

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    // Sales by month
    const monthSales = {};
    invoices.forEach(inv => {
      const month = new Date(inv.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short' });
      if (!monthSales[month]) {
        monthSales[month] = 0;
      }
      monthSales[month] += parseFloat(inv.total || 0);
    });

    const salesByMonth = Object.entries(monthSales)
      .map(([month, total]) => ({ month, total }))
      .slice(-6);

    setReportData({
      totalSales,
      totalPayments,
      totalOrders: orders.length,
      totalCustomers: customers.length,
      pendingPayments,
      topCustomers,
      topProducts,
      salesByMonth,
      recentInvoices: filteredInvoices.slice(-10).reverse()
    });
  };

  const exportToCSV = () => {
    const csvData = reportData.recentInvoices.map(inv => ({
      'Invoice Number': inv.invoiceNumber,
      'Customer': inv.customerName,
      'Date': new Date(inv.createdAt).toLocaleDateString('en-IN'),
      'Amount': inv.total,
      'Status': inv.status
    }));

    const headers = Object.keys(csvData[0] || {});
    const csv = [
      headers.join(','),
      ...csvData.map(row => headers.map(header => row[header]).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-report-${dateRange.startDate}-to-${dateRange.endDate}.csv`;
    a.click();
  };

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827' }}>
          Reports & Analytics
        </h1>
        <button onClick={exportToCSV} className="btn btn-success">
          <Download size={20} />
          Export CSV
        </button>
      </div>

      {/* Date Range Filter */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Calendar size={20} style={{ color: '#6b7280' }} />
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flex: 1 }}>
            <div style={{ flex: 1 }}>
              <label className="form-label" style={{ marginBottom: '4px' }}>Start Date</label>
              <input
                type="date"
                className="form-input"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label className="form-label" style={{ marginBottom: '4px' }}>End Date</label>
              <input
                type="date"
                className="form-input"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              />
            </div>
            <button onClick={generateReport} className="btn btn-primary" style={{ marginTop: '24px' }}>
              Generate
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-3" style={{ marginBottom: '32px' }}>
        <div style={{
          background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
          color: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>Total Sales</p>
              <h3 style={{ fontSize: '28px', fontWeight: 'bold' }}>
                ₹{reportData.totalSales.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </h3>
            </div>
            <TrendingUp size={32} />
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
          color: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>Total Payments</p>
              <h3 style={{ fontSize: '28px', fontWeight: 'bold' }}>
                ₹{reportData.totalPayments.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </h3>
            </div>
            <DollarSign size={32} />
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
          color: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>Pending Payments</p>
              <h3 style={{ fontSize: '28px', fontWeight: 'bold' }}>
                ₹{reportData.pendingPayments.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </h3>
            </div>
            <TrendingDown size={32} />
          </div>
        </div>
      </div>

      {/* Top Customers and Products */}
      <div className="grid grid-2" style={{ marginBottom: '32px' }}>
        <div className="card">
          <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#111827' }}>
            Top Customers
          </h2>
          {reportData.topCustomers.length > 0 ? (
            <table className="table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Orders</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {reportData.topCustomers.map((customer, index) => (
                  <tr key={index}>
                    <td style={{ fontWeight: '600' }}>{customer.name}</td>
                    <td>{customer.count}</td>
                    <td style={{ fontWeight: '600', color: '#16a34a' }}>
                      ₹{customer.total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p style={{ textAlign: 'center', color: '#9ca3af', padding: '20px' }}>No data available</p>
          )}
        </div>

        <div className="card">
          <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#111827' }}>
            Top Products
          </h2>
          {reportData.topProducts.length > 0 ? (
            <table className="table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {reportData.topProducts.map((product, index) => (
                  <tr key={index}>
                    <td style={{ fontWeight: '600' }}>{product.name}</td>
                    <td>{product.quantity.toFixed(2)}</td>
                    <td style={{ fontWeight: '600', color: '#16a34a' }}>
                      ₹{product.total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p style={{ textAlign: 'center', color: '#9ca3af', padding: '20px' }}>No data available</p>
          )}
        </div>
      </div>

      {/* Sales by Month */}
      <div className="card" style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#111827' }}>
          Sales Trend (Last 6 Months)
        </h2>
        {reportData.salesByMonth.length > 0 ? (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', height: '200px', padding: '20px' }}>
            {reportData.salesByMonth.map((item, index) => {
              const maxSale = Math.max(...reportData.salesByMonth.map(s => s.total));
              const height = (item.total / maxSale) * 160;
              
              return (
                <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{
                    width: '100%',
                    height: `${height}px`,
                    background: 'linear-gradient(180deg, #2563eb 0%, #1d4ed8 100%)',
                    borderRadius: '8px 8px 0 0',
                    position: 'relative',
                    transition: 'all 0.3s'
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: '-30px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#16a34a',
                      whiteSpace: 'nowrap'
                    }}>
                      ₹{item.total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </div>
                  </div>
                  <div style={{ marginTop: '8px', fontSize: '12px', fontWeight: '500', color: '#6b7280' }}>
                    {item.month}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p style={{ textAlign: 'center', color: '#9ca3af', padding: '40px' }}>No sales data available</p>
        )}
      </div>

      {/* Recent Invoices */}
      <div className="card">
        <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#111827' }}>
          Recent Invoices
        </h2>
        {reportData.recentInvoices.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {reportData.recentInvoices.map(invoice => (
                <tr key={invoice.id}>
                  <td style={{ fontWeight: '600' }}>{invoice.invoiceNumber}</td>
                  <td>{invoice.customerName}</td>
                  <td>{new Date(invoice.createdAt).toLocaleDateString('en-IN')}</td>
                  <td style={{ fontWeight: '600', color: '#16a34a' }}>
                    ₹{parseFloat(invoice.total).toLocaleString('en-IN')}
                  </td>
                  <td>
                    <span className={`badge ${
                      invoice.status === 'paid' ? 'badge-success' :
                      invoice.status === 'partial' ? 'badge-warning' : 'badge-danger'
                    }`}>
                      {invoice.status?.toUpperCase() || 'UNPAID'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ textAlign: 'center', color: '#9ca3af', padding: '40px' }}>No invoices in selected date range</p>
        )}
      </div>
    </div>
  );
}

export default Reports;


