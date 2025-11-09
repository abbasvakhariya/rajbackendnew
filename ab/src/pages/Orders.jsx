import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { orderService, customerService, productService } from '../utils/storage';

function Orders() {
  const [orders, setOrders] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);

  const [formData, setFormData] = useState({
    customerId: '',
    customerName: '',
    productId: '',
    productName: '',
    quantity: 1,
    unit: 'sq ft',
    price: 0,
    total: 0,
    status: 'pending',
    deliveryDate: '',
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setOrders(orderService.getAll());
    setCustomers(customerService.getAll());
    setProducts(productService.getAll());
  };

  const handleProductChange = (productId) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      const total = (formData.quantity * product.price).toFixed(2);
      setFormData({
        ...formData,
        productId: product.id,
        productName: product.name,
        price: product.price,
        unit: product.unit,
        total
      });
    }
  };

  const handleQuantityChange = (quantity) => {
    const qty = parseFloat(quantity) || 0;
    const total = (qty * parseFloat(formData.price)).toFixed(2);
    setFormData({
      ...formData,
      quantity: qty,
      total
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

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingOrder) {
      orderService.update(editingOrder.id, formData);
    } else {
      orderService.add(formData);
    }
    
    loadData();
    closeModal();
  };

  const handleEdit = (order) => {
    setEditingOrder(order);
    setFormData({
      customerId: order.customerId,
      customerName: order.customerName,
      productId: order.productId,
      productName: order.productName,
      quantity: order.quantity,
      unit: order.unit,
      price: order.price,
      total: order.total,
      status: order.status,
      deliveryDate: order.deliveryDate || '',
      notes: order.notes || ''
    });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      orderService.delete(id);
      loadData();
    }
  };

  const openModal = () => {
    setEditingOrder(null);
    setFormData({
      customerId: '',
      customerName: '',
      productId: '',
      productName: '',
      quantity: 1,
      unit: 'sq ft',
      price: 0,
      total: 0,
      status: 'pending',
      deliveryDate: '',
      notes: ''
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingOrder(null);
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'badge-warning',
      'in-progress': 'badge-info',
      completed: 'badge-success',
      cancelled: 'badge-danger'
    };
    return badges[status] || 'badge-info';
  };

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827' }}>
          Orders Management
        </h1>
        <button onClick={openModal} className="btn btn-primary">
          <Plus size={20} />
          Create Order
        </button>
      </div>

      <div className="card">
        {orders.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Product</th>
                <th>Quantity</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Delivery Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id}>
                  <td style={{ fontWeight: '600' }}>#{order.id.slice(-6).toUpperCase()}</td>
                  <td>{order.customerName}</td>
                  <td>{order.productName}</td>
                  <td>{order.quantity} {order.unit}</td>
                  <td style={{ fontWeight: '600', color: '#16a34a' }}>
                    ₹{parseFloat(order.total).toLocaleString('en-IN')}
                  </td>
                  <td>
                    <span className={`badge ${getStatusBadge(order.status)}`}>
                      {order.status?.toUpperCase().replace('-', ' ')}
                    </span>
                  </td>
                  <td>{order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString('en-IN') : '-'}</td>
                  <td>
                    <div className="action-buttons">
                      <button onClick={() => handleEdit(order)} className="icon-btn edit" title="Edit">
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => handleDelete(order.id)} className="icon-btn delete" title="Delete">
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
            <p>No orders yet</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                {editingOrder ? 'Edit Order' : 'Create New Order'}
              </h2>
              <button onClick={closeModal} className="modal-close">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
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
                <label className="form-label">Select Product *</label>
                <select
                  className="form-select"
                  value={formData.productId}
                  onChange={(e) => handleProductChange(e.target.value)}
                  required
                >
                  <option value="">Choose product</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name} - ₹{product.price}/{product.unit}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-2">
                <div className="form-group">
                  <label className="form-label">Quantity *</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-input"
                    value={formData.quantity}
                    onChange={(e) => handleQuantityChange(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Price per Unit</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-input"
                    value={formData.price}
                    onChange={(e) => {
                      const price = e.target.value;
                      const total = (price * formData.quantity).toFixed(2);
                      setFormData({ ...formData, price, total });
                    }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Total Amount</label>
                <input
                  type="text"
                  className="form-input"
                  value={`₹${parseFloat(formData.total || 0).toLocaleString('en-IN')}`}
                  readOnly
                  style={{ background: '#f9fafb', fontWeight: 'bold', color: '#16a34a' }}
                />
              </div>

              <div className="grid grid-2">
                <div className="form-group">
                  <label className="form-label">Order Status *</label>
                  <select
                    className="form-select"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    required
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Expected Delivery Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={formData.deliveryDate}
                    onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
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
                  {editingOrder ? 'Update' : 'Create'} Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Orders;


