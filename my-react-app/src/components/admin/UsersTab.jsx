import { useState, useEffect } from 'react';
import { adminAPI } from '../../utils/api';
import './AdminTabs.css';

const UsersTab = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    companyName: '',
    phone: '',
    subscriptionTier: 'trial',
    subscriptionStatus: 'trial',
    subscriptionEndDate: ''
  });

  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchTerm, statusFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 20,
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter && { status: statusFilter })
      };
      const data = await adminAPI.getUsers(params);
      if (data.success) {
        setUsers(data.users);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      alert('Error fetching users: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const data = await adminAPI.createUser(formData);
      if (data.success) {
        alert('User created successfully!');
        setShowAddModal(false);
        setFormData({
          email: '',
          password: '',
          fullName: '',
          companyName: '',
          phone: '',
          subscriptionTier: 'trial',
          subscriptionStatus: 'trial',
          subscriptionEndDate: ''
        });
        fetchUsers();
      }
    } catch (error) {
      alert('Error creating user: ' + (error.message || 'Unknown error'));
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }
    try {
      const data = await adminAPI.deleteUser(userId);
      if (data.success) {
        alert('User deleted successfully!');
        fetchUsers();
      }
    } catch (error) {
      alert('Error deleting user: ' + (error.message || 'Unknown error'));
    }
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    try {
      const data = await adminAPI.updateUser(selectedUser._id, formData);
      if (data.success) {
        alert('User updated successfully!');
        setShowEditModal(false);
        fetchUsers();
      }
    } catch (error) {
      alert('Error updating user: ' + (error.message || 'Unknown error'));
    }
  };

  const handleViewUser = async (userId) => {
    try {
      const data = await adminAPI.getUserDetails(userId);
      if (data.success) {
        setSelectedUser(data);
        setShowViewModal(true);
      }
    } catch (error) {
      alert('Error fetching user details: ' + (error.message || 'Unknown error'));
    }
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setFormData({
      email: user.email,
      fullName: user.fullName,
      companyName: user.companyName || '',
      phone: user.phone || '',
      subscriptionTier: user.subscriptionTier,
      subscriptionStatus: user.subscriptionStatus,
      subscriptionEndDate: user.subscriptionEndDate ? new Date(user.subscriptionEndDate).toISOString().split('T')[0] : ''
    });
    setShowEditModal(true);
  };

  const handleBulkAction = async (action) => {
    if (selectedUsers.length === 0) {
      alert('Please select users first');
      return;
    }
    try {
      const data = await adminAPI.bulkUserAction(selectedUsers, action, {});
      if (data.success) {
        alert(`Bulk ${action} completed for ${selectedUsers.length} user(s)`);
        setSelectedUsers([]);
        fetchUsers();
      }
    } catch (error) {
      alert('Error performing bulk action: ' + (error.message || 'Unknown error'));
    }
  };

  return (
    <div className="users-tab">
      <div className="tab-header">
        <h2>User Management</h2>
        <p className="tab-subtitle">Manage all users and their subscriptions</p>
      </div>

      {/* Filters and Actions */}
      <div className="tab-toolbar">
        <div className="toolbar-left">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="trial">Trial</option>
            <option value="expired">Expired</option>
          </select>
        </div>
        <div className="toolbar-right">
          {selectedUsers.length > 0 && (
            <div className="bulk-actions">
              <button onClick={() => handleBulkAction('activate')} className="btn-sm btn-success">
                Activate ({selectedUsers.length})
              </button>
              <button onClick={() => handleBulkAction('deactivate')} className="btn-sm btn-warning">
                Deactivate ({selectedUsers.length})
              </button>
            </div>
          )}
          <button onClick={() => setShowAddModal(true)} className="btn-primary">+ Add User</button>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="tab-loading">Loading users...</div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedUsers(users.map(u => u._id));
                      } else {
                        setSelectedUsers([]);
                      }
                    }}
                  />
                </th>
                <th>Email</th>
                <th>Name</th>
                <th>Status</th>
                <th>Subscription</th>
                <th>End Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>
                    No users found
                  </td>
                </tr>
              ) : (
                users.map(user => (
                  <tr key={user._id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUsers([...selectedUsers, user._id]);
                          } else {
                            setSelectedUsers(selectedUsers.filter(id => id !== user._id));
                          }
                        }}
                      />
                    </td>
                    <td>{user.email}</td>
                    <td>{user.fullName}</td>
                    <td>
                      <span className={`badge status-${user.subscriptionStatus}`}>
                        {user.subscriptionStatus}
                      </span>
                    </td>
                    <td>{user.subscriptionTier}</td>
                    <td>{new Date(user.subscriptionEndDate).toLocaleDateString()}</td>
                    <td>
                      <div className="action-buttons">
                        <button onClick={() => handleViewUser(user._id)} className="btn-sm btn-view">View</button>
                        <button onClick={() => openEditModal(user)} className="btn-sm btn-edit">Edit</button>
                        <button onClick={() => handleDeleteUser(user._id)} className="btn-sm btn-delete">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span>Page {pagination.page} of {pagination.pages}</span>
          <button
            onClick={() => setCurrentPage(p => Math.min(pagination.pages, p + 1))}
            disabled={currentPage === pagination.pages}
          >
            Next
          </button>
        </div>
      )}

      {/* Add User Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New User</h2>
              <button onClick={() => setShowAddModal(false)} className="close-btn">×</button>
            </div>
            <form onSubmit={handleAddUser} className="modal-body">
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="form-input"
                  placeholder="Leave empty for default password"
                />
              </div>
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Company Name</label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="form-input"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Subscription Tier</label>
                  <select
                    value={formData.subscriptionTier}
                    onChange={(e) => setFormData({ ...formData, subscriptionTier: e.target.value })}
                    className="form-input"
                  >
                    <option value="trial">Trial</option>
                    <option value="1_month">1 Month</option>
                    <option value="3_months">3 Months</option>
                    <option value="6_months">6 Months</option>
                    <option value="12_months">12 Months</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={formData.subscriptionStatus}
                    onChange={(e) => setFormData({ ...formData, subscriptionStatus: e.target.value })}
                    className="form-input"
                  >
                    <option value="trial">Trial</option>
                    <option value="active">Active</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Subscription End Date</label>
                <input
                  type="date"
                  value={formData.subscriptionEndDate}
                  onChange={(e) => setFormData({ ...formData, subscriptionEndDate: e.target.value })}
                  className="form-input"
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Create User</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit User</h2>
              <button onClick={() => setShowEditModal(false)} className="close-btn">×</button>
            </div>
            <form onSubmit={handleEditUser} className="modal-body">
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Company Name</label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="form-input"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Subscription Tier</label>
                  <select
                    value={formData.subscriptionTier}
                    onChange={(e) => setFormData({ ...formData, subscriptionTier: e.target.value })}
                    className="form-input"
                  >
                    <option value="trial">Trial</option>
                    <option value="1_month">1 Month</option>
                    <option value="3_months">3 Months</option>
                    <option value="6_months">6 Months</option>
                    <option value="12_months">12 Months</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={formData.subscriptionStatus}
                    onChange={(e) => setFormData({ ...formData, subscriptionStatus: e.target.value })}
                    className="form-input"
                  >
                    <option value="trial">Trial</option>
                    <option value="active">Active</option>
                    <option value="expired">Expired</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Subscription End Date</label>
                <input
                  type="date"
                  value={formData.subscriptionEndDate}
                  onChange={(e) => setFormData({ ...formData, subscriptionEndDate: e.target.value })}
                  className="form-input"
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowEditModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Update User</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View User Modal */}
      {showViewModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>User Details</h2>
              <button onClick={() => setShowViewModal(false)} className="close-btn">×</button>
            </div>
            <div className="modal-body">
              <div className="detail-section">
                <h3>User Information</h3>
                <p><strong>Email:</strong> {selectedUser.user.email}</p>
                <p><strong>Name:</strong> {selectedUser.user.fullName}</p>
                <p><strong>Company:</strong> {selectedUser.user.companyName || '-'}</p>
                <p><strong>Phone:</strong> {selectedUser.user.phone || '-'}</p>
                <p><strong>Email Verified:</strong> {selectedUser.user.isEmailVerified ? 'Yes' : 'No'}</p>
              </div>
              <div className="detail-section">
                <h3>Subscription Information</h3>
                <p><strong>Tier:</strong> {selectedUser.user.subscriptionTier}</p>
                <p><strong>Status:</strong> {selectedUser.user.subscriptionStatus}</p>
                <p><strong>Start Date:</strong> {new Date(selectedUser.user.subscriptionStartDate).toLocaleDateString()}</p>
                <p><strong>End Date:</strong> {new Date(selectedUser.user.subscriptionEndDate).toLocaleDateString()}</p>
              </div>
              <div className="detail-section">
                <h3>Usage Statistics</h3>
                <p><strong>Total Windows:</strong> {selectedUser.windowsCount || 0}</p>
                <p><strong>Total Subscriptions:</strong> {selectedUser.subscriptions?.length || 0}</p>
              </div>
              <div className="modal-actions">
                <button onClick={() => { setShowViewModal(false); openEditModal(selectedUser.user); }} className="btn-primary">Edit User</button>
                <button onClick={() => setShowViewModal(false)} className="btn-secondary">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersTab;
