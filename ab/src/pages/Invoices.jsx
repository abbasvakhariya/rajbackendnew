import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Eye, Printer, X } from 'lucide-react';
import { invoiceService, customerService, productService, settingsService } from '../utils/storage';

function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [viewingInvoice, setViewingInvoice] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [settings, setSettings] = useState({});

  const [formData, setFormData] = useState({
    customerId: '',
    customerName: '',
    items: [],
    subtotal: 0,
    taxRate: 18,
    taxAmount: 0,
    discount: 0,
    total: 0,
    notes: '',
    dueDate: '',
    status: 'unpaid'
  });

  const [currentItem, setCurrentItem] = useState({
    productId: '',
    productName: '',
    description: '',
    quantity: 1,
    unit: 'sq ft',
    price: 0,
    total: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setInvoices(invoiceService.getAll());
    setCustomers(customerService.getAll());
    setProducts(productService.getAll());
    const appSettings = settingsService.get();
    setSettings(appSettings);
    setFormData(prev => ({ ...prev, taxRate: appSettings.taxRate || 18 }));
  };

  const calculateTotal = (items, discount, taxRate) => {
    const subtotal = items.reduce((sum, item) => sum + parseFloat(item.total || 0), 0);
    const discountAmount = parseFloat(discount) || 0;
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = (taxableAmount * parseFloat(taxRate)) / 100;
    const total = taxableAmount + taxAmount;

    return {
      subtotal: subtotal.toFixed(2),
      taxAmount: taxAmount.toFixed(2),
      total: total.toFixed(2)
    };
  };

  const handleAddItem = () => {
    if (!currentItem.productId || currentItem.quantity <= 0) {
      alert('Please select a product and enter valid quantity');
      return;
    }

    const product = products.find(p => p.id === currentItem.productId);
    const itemTotal = parseFloat(currentItem.quantity) * parseFloat(currentItem.price);

    const newItem = {
      ...currentItem,
      productName: product.name,
      unit: product.unit,
      total: itemTotal.toFixed(2)
    };

    const updatedItems = [...formData.items, newItem];
    const calculations = calculateTotal(updatedItems, formData.discount, formData.taxRate);

    setFormData({
      ...formData,
      items: updatedItems,
      ...calculations
    });

    setCurrentItem({
      productId: '',
      productName: '',
      description: '',
      quantity: 1,
      unit: 'sq ft',
      price: 0,
      total: 0
    });
  };

  const handleRemoveItem = (index) => {
    const updatedItems = formData.items.filter((_, i) => i !== index);
    const calculations = calculateTotal(updatedItems, formData.discount, formData.taxRate);
    
    setFormData({
      ...formData,
      items: updatedItems,
      ...calculations
    });
  };

  const handleProductChange = (productId) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      setCurrentItem({
        ...currentItem,
        productId: product.id,
        productName: product.name,
        description: product.description || '',
        price: product.price,
        unit: product.unit,
        total: (currentItem.quantity * product.price).toFixed(2)
      });
    }
  };

  const handleQuantityChange = (quantity) => {
    const qty = parseFloat(quantity) || 0;
    setCurrentItem({
      ...currentItem,
      quantity: qty,
      total: (qty * parseFloat(currentItem.price)).toFixed(2)
    });
  };

  const handleCustomerChange = (customerId) => {
    const customer = customers.find(c => c.id === customerId);
    setFormData({
      ...formData,
      customerId,
      customerName: customer ? customer.name : ''
    });
  };

  const handleDiscountChange = (discount) => {
    const calculations = calculateTotal(formData.items, discount, formData.taxRate);
    setFormData({
      ...formData,
      discount,
      ...calculations
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (formData.items.length === 0) {
      alert('Please add at least one item');
      return;
    }

    const invoiceNumber = editingInvoice 
      ? editingInvoice.invoiceNumber 
      : `${settings.invoicePrefix || 'INV'}-${String(invoiceService.getNextNumber()).padStart(4, '0')}`;

    const invoiceData = {
      ...formData,
      invoiceNumber,
      date: new Date().toISOString()
    };

    if (editingInvoice) {
      invoiceService.update(editingInvoice.id, invoiceData);
    } else {
      invoiceService.add(invoiceData);
    }
    
    loadData();
    closeModal();
  };

  const handleView = (invoice) => {
    setViewingInvoice(invoice);
    setShowViewModal(true);
  };

  const handleEdit = (invoice) => {
    setEditingInvoice(invoice);
    setFormData({
      customerId: invoice.customerId,
      customerName: invoice.customerName,
      items: invoice.items,
      subtotal: invoice.subtotal,
      taxRate: invoice.taxRate,
      taxAmount: invoice.taxAmount,
      discount: invoice.discount,
      total: invoice.total,
      notes: invoice.notes || '',
      dueDate: invoice.dueDate || '',
      status: invoice.status || 'unpaid'
    });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      invoiceService.delete(id);
      loadData();
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const openModal = () => {
    setEditingInvoice(null);
    setFormData({
      customerId: '',
      customerName: '',
      items: [],
      subtotal: 0,
      taxRate: settings.taxRate || 18,
      taxAmount: 0,
      discount: 0,
      total: 0,
      notes: '',
      dueDate: '',
      status: 'unpaid'
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingInvoice(null);
  };

  const getStatusBadge = (status) => {
    const badges = {
      paid: 'badge-success',
      unpaid: 'badge-danger',
      partial: 'badge-warning'
    };
    return badges[status] || 'badge-info';
  };

  return (
    <div className="container">
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827' }}>
          Invoices
        </h1>
        <button onClick={openModal} className="btn btn-primary">
          <Plus size={20} />
          Create Invoice
        </button>
      </div>

      <div className="card no-print">
        {invoices.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map(invoice => (
                <tr key={invoice.id}>
                  <td style={{ fontWeight: '600' }}>{invoice.invoiceNumber}</td>
                  <td>{invoice.customerName}</td>
                  <td>{new Date(invoice.createdAt).toLocaleDateString('en-IN')}</td>
                  <td style={{ fontWeight: '600', color: '#16a34a' }}>
                    ₹{parseFloat(invoice.total).toLocaleString('en-IN')}
                  </td>
                  <td>
                    <span className={`badge ${getStatusBadge(invoice.status)}`}>
                      {invoice.status?.toUpperCase() || 'UNPAID'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button onClick={() => handleView(invoice)} className="icon-btn view" title="View">
                        <Eye size={18} />
                      </button>
                      <button onClick={() => handleEdit(invoice)} className="icon-btn edit" title="Edit">
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => handleDelete(invoice.id)} className="icon-btn delete" title="Delete">
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
            <p>No invoices yet</p>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" style={{ maxWidth: '900px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                {editingInvoice ? 'Edit Invoice' : 'Create New Invoice'}
              </h2>
              <button onClick={closeModal} className="modal-close">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-2">
                <div className="form-group">
                  <label className="form-label">Select Customer *</label>
                  <select
                    className="form-select"
                    value={formData.customerId}
                    onChange={(e) => handleCustomerChange(e.target.value)}
                    required
                  >
                    <option value="">Choose customer</option>
                    {customers.map(customer => (
                      <option key={customer.id} value={customer.id}>{customer.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Payment Status</label>
                  <select
                    className="form-select"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="unpaid">Unpaid</option>
                    <option value="partial">Partially Paid</option>
                    <option value="paid">Paid</option>
                  </select>
                </div>
              </div>

              <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>Add Items</h3>
                
                <div className="grid grid-2" style={{ marginBottom: '12px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Product</label>
                    <select
                      className="form-select"
                      value={currentItem.productId}
                      onChange={(e) => handleProductChange(e.target.value)}
                    >
                      <option value="">Select product</option>
                      {products.map(product => (
                        <option key={product.id} value={product.id}>
                          {product.name} - ₹{product.price}/{product.unit}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Quantity</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-input"
                      value={currentItem.quantity}
                      onChange={(e) => handleQuantityChange(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-2" style={{ marginBottom: '12px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Price per Unit</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-input"
                      value={currentItem.price}
                      onChange={(e) => setCurrentItem({ ...currentItem, price: e.target.value, total: (e.target.value * currentItem.quantity).toFixed(2) })}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Total</label>
                    <input
                      type="text"
                      className="form-input"
                      value={`₹${parseFloat(currentItem.total || 0).toLocaleString('en-IN')}`}
                      readOnly
                      style={{ background: '#f9fafb' }}
                    />
                  </div>
                </div>

                <button type="button" onClick={handleAddItem} className="btn btn-success">
                  <Plus size={18} />
                  Add Item
                </button>
              </div>

              {/* Items List */}
              {formData.items.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>Items List</h3>
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Quantity</th>
                        <th>Price</th>
                        <th>Total</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.items.map((item, index) => (
                        <tr key={index}>
                          <td>{item.productName}</td>
                          <td>{item.quantity} {item.unit}</td>
                          <td>₹{parseFloat(item.price).toLocaleString('en-IN')}</td>
                          <td style={{ fontWeight: '600' }}>₹{parseFloat(item.total).toLocaleString('en-IN')}</td>
                          <td>
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(index)}
                              className="icon-btn delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Totals */}
              <div style={{ background: '#f9fafb', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
                <div className="grid grid-2">
                  <div>
                    <div className="form-group">
                      <label className="form-label">Discount (₹)</label>
                      <input
                        type="number"
                        step="0.01"
                        className="form-input"
                        value={formData.discount}
                        onChange={(e) => handleDiscountChange(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                      <span>Subtotal:</span>
                      <strong>₹{parseFloat(formData.subtotal || 0).toLocaleString('en-IN')}</strong>
                    </div>
                    <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                      <span>Discount:</span>
                      <strong>-₹{parseFloat(formData.discount || 0).toLocaleString('en-IN')}</strong>
                    </div>
                    <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                      <span>Tax ({formData.taxRate}%):</span>
                      <strong>₹{parseFloat(formData.taxAmount || 0).toLocaleString('en-IN')}</strong>
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', color: '#16a34a' }}>
                      <span>Total:</span>
                      <span>₹{parseFloat(formData.total || 0).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-2">
                <div className="form-group">
                  <label className="form-label">Due Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Notes</label>
                  <textarea
                    className="form-textarea"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    style={{ minHeight: '60px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button type="button" onClick={closeModal} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingInvoice ? 'Update' : 'Create'} Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal with Print */}
      {showViewModal && viewingInvoice && (
        <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
          <div className="modal print-area" style={{ maxWidth: '800px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header no-print">
              <h2 className="modal-title">Invoice Details</h2>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={handlePrint} className="btn btn-primary">
                  <Printer size={18} />
                  Print
                </button>
                <button onClick={() => setShowViewModal(false)} className="modal-close">
                  <X size={24} />
                </button>
              </div>
            </div>

            <div style={{ padding: '20px', background: 'white' }}>
              {/* Header */}
              <div style={{ textAlign: 'center', marginBottom: '30px', borderBottom: '2px solid #2563eb', paddingBottom: '20px' }}>
                <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#2563eb' }}>
                  {settings.companyName || 'Babji Glass'}
                </h1>
                <p>{settings.companyAddress}</p>
                <p>{settings.companyPhone} | {settings.companyEmail}</p>
                {settings.companyGST && <p>GST: {settings.companyGST}</p>}
              </div>

              {/* Invoice Info */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px' }}>INVOICE</h3>
                  <p><strong>Number:</strong> {viewingInvoice.invoiceNumber}</p>
                  <p><strong>Date:</strong> {new Date(viewingInvoice.createdAt).toLocaleDateString('en-IN')}</p>
                  {viewingInvoice.dueDate && (
                    <p><strong>Due Date:</strong> {new Date(viewingInvoice.dueDate).toLocaleDateString('en-IN')}</p>
                  )}
                  <p><strong>Status:</strong> <span className={`badge ${getStatusBadge(viewingInvoice.status)}`}>
                    {viewingInvoice.status?.toUpperCase()}
                  </span></p>
                </div>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px' }}>BILL TO</h3>
                  <p><strong>{viewingInvoice.customerName}</strong></p>
                </div>
              </div>

              {/* Items */}
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
                <thead>
                  <tr style={{ background: '#f3f4f6', borderBottom: '2px solid #d1d5db' }}>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Item</th>
                    <th style={{ padding: '12px', textAlign: 'center' }}>Quantity</th>
                    <th style={{ padding: '12px', textAlign: 'right' }}>Price</th>
                    <th style={{ padding: '12px', textAlign: 'right' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {viewingInvoice.items.map((item, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '12px' }}>{item.productName}</td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>{item.quantity} {item.unit}</td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>₹{parseFloat(item.price).toLocaleString('en-IN')}</td>
                      <td style={{ padding: '12px', textAlign: 'right', fontWeight: '600' }}>
                        ₹{parseFloat(item.total).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
                <div style={{ width: '300px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e5e7eb' }}>
                    <span>Subtotal:</span>
                    <span>₹{parseFloat(viewingInvoice.subtotal).toLocaleString('en-IN')}</span>
                  </div>
                  {viewingInvoice.discount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e5e7eb' }}>
                      <span>Discount:</span>
                      <span>-₹{parseFloat(viewingInvoice.discount).toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e5e7eb' }}>
                    <span>Tax ({viewingInvoice.taxRate}%):</span>
                    <span>₹{parseFloat(viewingInvoice.taxAmount).toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', fontSize: '20px', fontWeight: 'bold', color: '#16a34a' }}>
                    <span>Total:</span>
                    <span>₹{parseFloat(viewingInvoice.total).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {viewingInvoice.notes && (
                <div style={{ marginTop: '20px', padding: '12px', background: '#f9fafb', borderRadius: '6px' }}>
                  <strong>Notes:</strong>
                  <p style={{ marginTop: '8px' }}>{viewingInvoice.notes}</p>
                </div>
              )}

              {settings.termsAndConditions && (
                <div style={{ marginTop: '30px', fontSize: '12px', color: '#6b7280' }}>
                  <strong>Terms & Conditions:</strong>
                  <p style={{ marginTop: '8px' }}>{settings.termsAndConditions}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Invoices;


