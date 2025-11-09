import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { paymentService, invoiceService, customerService } from '../utils/storage';

function Payments() {
  const [payments, setPayments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);

  const [formData, setFormData] = useState({
    invoiceId: '',
    invoiceNumber: '',
    customerId: '',
    customerName: '',
    amount: 0,
    paymentMethod: 'cash',
    paymentDate: new Date().toISOString().split('T')[0],
    transactionId: '',
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setPayments(paymentService.getAll());
    setInvoices(invoiceService.getAll());
    setCustomers(customerService.getAll());
  };

  const handleInvoiceChange = (invoiceId) => {
    const invoice = invoices.find(inv => inv.id === invoiceId);
    if (invoice) {
      setFormData({
        ...formData,
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        customerId: invoice.customerId,
        customerName: invoice.customerName,
        amount: invoice.total
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingPayment) {
      paymentService.update(editingPayment.id, formData);
    } else {
      paymentService.add(formData);
      
      // Update invoice status
      const invoice = invoices.find(inv => inv.id === formData.invoiceId);
      if (invoice) {
        const totalPaid = paymentService.getByInvoice(formData.invoiceId)
          .reduce((sum, p) => sum + parseFloat(p.amount), 0) + parseFloat(formData.amount);
        
        let status = 'unpaid';
        if (totalPaid >= parseFloat(invoice.total)) {
          status = 'paid';
        } else if (totalPaid > 0) {
          status = 'partial';
        }
        
        invoiceService.update(invoice.id, { status });
      }
    }
    
    loadData();
    closeModal();
  };

  const handleEdit = (payment) => {
    setEditingPayment(payment);
    setFormData({
      invoiceId: payment.invoiceId,
      invoiceNumber: payment.invoiceNumber,
      customerId: payment.customerId,
      customerName: payment.customerName,
      amount: payment.amount,
      paymentMethod: payment.paymentMethod,
      paymentDate: payment.paymentDate,
      transactionId: payment.transactionId || '',
      notes: payment.notes || ''
    });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this payment?')) {
      paymentService.delete(id);
      loadData();
    }
  };

  const openModal = () => {
    setEditingPayment(null);
    setFormData({
      invoiceId: '',
      invoiceNumber: '',
      customerId: '',
      customerName: '',
      amount: 0,
      paymentMethod: 'cash',
      paymentDate: new Date().toISOString().split('T')[0],
      transactionId: '',
      notes: ''
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingPayment(null);
  };

  const paymentMethods = [
    { value: 'cash', label: 'Cash' },
    { value: 'card', label: 'Credit/Debit Card' },
    { value: 'upi', label: 'UPI' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'cheque', label: 'Cheque' },
    { value: 'other', label: 'Other' }
  ];

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827' }}>
          Payment Records
        </h1>
        <button onClick={openModal} className="btn btn-primary">
          <Plus size={20} />
          Add Payment
        </button>
      </div>

      <div className="card">
        {payments.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>Payment ID</th>
                <th>Invoice #</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Date</th>
                <th>Transaction ID</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.map(payment => (
                <tr key={payment.id}>
                  <td style={{ fontWeight: '600' }}>#{payment.id.slice(-6).toUpperCase()}</td>
                  <td>{payment.invoiceNumber}</td>
                  <td>{payment.customerName}</td>
                  <td style={{ fontWeight: '600', color: '#16a34a' }}>
                    ₹{parseFloat(payment.amount).toLocaleString('en-IN')}
                  </td>
                  <td>
                    <span className="badge badge-info">
                      {payment.paymentMethod?.toUpperCase().replace('_', ' ')}
                    </span>
                  </td>
                  <td>{new Date(payment.paymentDate).toLocaleDateString('en-IN')}</td>
                  <td>{payment.transactionId || '-'}</td>
                  <td>
                    <div className="action-buttons">
                      <button onClick={() => handleEdit(payment)} className="icon-btn edit" title="Edit">
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => handleDelete(payment.id)} className="icon-btn delete" title="Delete">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
            <p>No payment records yet</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                {editingPayment ? 'Edit Payment' : 'Add New Payment'}
              </h2>
              <button onClick={closeModal} className="modal-close">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Select Invoice *</label>
                <select
                  className="form-select"
                  value={formData.invoiceId}
                  onChange={(e) => handleInvoiceChange(e.target.value)}
                  required
                >
                  <option value="">Choose invoice</option>
                  {invoices.map(invoice => (
                    <option key={invoice.id} value={invoice.id}>
                      {invoice.invoiceNumber} - {invoice.customerName} - ₹{parseFloat(invoice.total).toLocaleString('en-IN')}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Customer</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.customerName}
                  readOnly
                  style={{ background: '#f9fafb' }}
                />
              </div>

              <div className="grid grid-2">
                <div className="form-group">
                  <label className="form-label">Payment Amount (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-input"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Payment Method *</label>
                  <select
                    className="form-select"
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    required
                  >
                    {paymentMethods.map(method => (
                      <option key={method.value} value={method.value}>{method.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-2">
                <div className="form-group">
                  <label className="form-label">Payment Date *</label>
                  <input
                    type="date"
                    className="form-input"
                    value={formData.paymentDate}
                    onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Transaction ID</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Optional"
                    value={formData.transactionId}
                    onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Notes</label>
                <textarea
                  className="form-textarea"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button type="button" onClick={closeModal} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingPayment ? 'Update' : 'Add'} Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Payments;


