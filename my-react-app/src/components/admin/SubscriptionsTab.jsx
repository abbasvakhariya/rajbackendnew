import { useState, useEffect } from 'react';
import { adminAPI } from '../../utils/api';
import './AdminTabs.css';

const SubscriptionsTab = () => {
  const [plans, setPlans] = useState({});
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [newPlan, setNewPlan] = useState({
    key: '',
    name: '',
    price: '',
    duration: '',
    billingCycle: 'monthly'
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getPlans();
      if (data.success) {
        setPlans(data.plans);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
      alert('Error fetching plans: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePlan = async (planKey, updatedPlan) => {
    try {
      const updatedPlans = { ...plans, [planKey]: updatedPlan };
      const data = await adminAPI.updatePlans(updatedPlans);
      if (data.success) {
        alert('Plan updated successfully!');
        setPlans(updatedPlans);
        setShowEditModal(false);
        setEditingPlan(null);
      }
    } catch (error) {
      alert('Error updating plan: ' + (error.message || 'Unknown error'));
    }
  };

  const handleAddPlan = async (e) => {
    e.preventDefault();
    try {
      if (!newPlan.key || !newPlan.name || !newPlan.price || !newPlan.duration) {
        alert('Please fill all required fields');
        return;
      }

      const planKey = newPlan.key.toLowerCase().replace(/\s+/g, '_');
      const updatedPlans = {
        ...plans,
        [planKey]: {
          name: newPlan.name,
          price: parseFloat(newPlan.price),
          duration: parseInt(newPlan.duration),
          billingCycle: newPlan.billingCycle
        }
      };

      const data = await adminAPI.updatePlans(updatedPlans);
      if (data.success) {
        alert('Plan added successfully!');
        setPlans(updatedPlans);
        setNewPlan({
          key: '',
          name: '',
          price: '',
          duration: '',
          billingCycle: 'monthly'
        });
      }
    } catch (error) {
      alert('Error adding plan: ' + (error.message || 'Unknown error'));
    }
  };

  const handleDeletePlan = async (planKey) => {
    if (!window.confirm('Are you sure you want to delete this plan?')) {
      return;
    }
    try {
      const updatedPlans = { ...plans };
      delete updatedPlans[planKey];
      const data = await adminAPI.updatePlans(updatedPlans);
      if (data.success) {
        alert('Plan deleted successfully!');
        setPlans(updatedPlans);
      }
    } catch (error) {
      alert('Error deleting plan: ' + (error.message || 'Unknown error'));
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  if (loading) {
    return <div className="tab-loading">Loading plans...</div>;
  }

  return (
    <div className="subscriptions-tab">
      <div className="tab-header">
        <h2>Subscription Management</h2>
        <p className="tab-subtitle">Manage subscription plans and pricing</p>
      </div>

      <div className="tab-toolbar">
        <div className="toolbar-right">
          <button onClick={() => setShowEditModal(true)} className="btn-primary">+ Add New Plan</button>
        </div>
      </div>

      <div className="plans-grid">
        {Object.entries(plans).map(([key, plan]) => (
          <div key={key} className="plan-card">
            <div className="plan-header">
              <h3>{plan.name || key.replace(/_/g, ' ')}</h3>
              <span className="plan-key">{key}</span>
            </div>
            <div className="plan-body">
              <div className="plan-info">
                <div className="info-item">
                  <span className="info-label">Price:</span>
                  <span className="info-value">{formatCurrency(plan.price)}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Duration:</span>
                  <span className="info-value">{plan.duration} {plan.duration === 1 ? 'Month' : 'Months'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Billing Cycle:</span>
                  <span className="info-value">{plan.billingCycle}</span>
                </div>
              </div>
            </div>
            <div className="plan-actions">
              <button
                onClick={() => {
                  setEditingPlan({ key, ...plan });
                  setShowEditModal(true);
                }}
                className="btn-sm btn-edit"
              >
                Edit
              </button>
              <button
                onClick={() => handleDeletePlan(key)}
                className="btn-sm btn-delete"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit/Add Plan Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => { setShowEditModal(false); setEditingPlan(null); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingPlan ? 'Edit Plan' : 'Add New Plan'}</h2>
              <button onClick={() => { setShowEditModal(false); setEditingPlan(null); }} className="close-btn">×</button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (editingPlan) {
                  handleUpdatePlan(editingPlan.key, {
                    name: editingPlan.name,
                    price: parseFloat(editingPlan.price),
                    duration: parseInt(editingPlan.duration),
                    billingCycle: editingPlan.billingCycle
                  });
                } else {
                  handleAddPlan(e);
                }
              }}
              className="modal-body"
            >
              {editingPlan ? (
                <>
                  <div className="form-group">
                    <label>Plan Key (read-only)</label>
                    <input
                      type="text"
                      value={editingPlan.key}
                      disabled
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Plan Name *</label>
                    <input
                      type="text"
                      required
                      value={editingPlan.name || ''}
                      onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Price (INR) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={editingPlan.price || ''}
                      onChange={(e) => setEditingPlan({ ...editingPlan, price: e.target.value })}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Duration (Months) *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={editingPlan.duration || ''}
                      onChange={(e) => setEditingPlan({ ...editingPlan, duration: e.target.value })}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Billing Cycle</label>
                    <select
                      value={editingPlan.billingCycle || 'monthly'}
                      onChange={(e) => setEditingPlan({ ...editingPlan, billingCycle: e.target.value })}
                      className="form-input"
                    >
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="semi_annual">Semi-Annual</option>
                      <option value="annual">Annual</option>
                    </select>
                  </div>
                </>
              ) : (
                <>
                  <div className="form-group">
                    <label>Plan Key * (e.g., "24_months")</label>
                    <input
                      type="text"
                      required
                      value={newPlan.key}
                      onChange={(e) => setNewPlan({ ...newPlan, key: e.target.value })}
                      className="form-input"
                      placeholder="24_months"
                    />
                  </div>
                  <div className="form-group">
                    <label>Plan Name *</label>
                    <input
                      type="text"
                      required
                      value={newPlan.name}
                      onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
                      className="form-input"
                      placeholder="24 Months"
                    />
                  </div>
                  <div className="form-group">
                    <label>Price (INR) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={newPlan.price}
                      onChange={(e) => setNewPlan({ ...newPlan, price: e.target.value })}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Duration (Months) *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={newPlan.duration}
                      onChange={(e) => setNewPlan({ ...newPlan, duration: e.target.value })}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Billing Cycle</label>
                    <select
                      value={newPlan.billingCycle}
                      onChange={(e) => setNewPlan({ ...newPlan, billingCycle: e.target.value })}
                      className="form-input"
                    >
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="semi_annual">Semi-Annual</option>
                      <option value="annual">Annual</option>
                    </select>
                  </div>
                </>
              )}
              <div className="modal-actions">
                <button type="button" onClick={() => { setShowEditModal(false); setEditingPlan(null); }} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">{editingPlan ? 'Update Plan' : 'Add Plan'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionsTab;
