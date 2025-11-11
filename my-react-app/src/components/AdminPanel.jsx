import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import './AdminPanel.css';

const AdminPanel = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});

  // ONLY this email can access admin panel
  const ADMIN_EMAIL = 'abbasvakhariya00@gmail.com';

  useEffect(() => {
    // Check if user is the specific admin email
    if (!user || !user.email || user.email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      navigate('/dashboard');
      return;
    }
    fetchStats();
    fetchUsers();
  }, [user, currentPage, searchTerm, statusFilter, navigate]);

  const fetchStats = async () => {
    try {
      const data = await adminAPI.getStats();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
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
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (userId, action, data = {}) => {
    try {
      let result;
      if (action === 'delete') {
        result = await adminAPI.deleteUser(userId);
      } else {
        result = await adminAPI.updateUser(userId, data);
      }

      if (result.success) {
        alert(result.message);
        fetchUsers();
        fetchStats();
        if (selectedUser && selectedUser.user?._id === userId) {
          setSelectedUser(null);
        }
      } else {
        alert(result.message || 'Action failed');
      }
    } catch (error) {
      console.error('Error performing action:', error);
      alert('Error performing action: ' + (error.message || 'Unknown error'));
    }
  };

  const viewUserDetails = async (userId) => {
    try {
      const data = await adminAPI.getUserDetails(userId);
      if (data.success) {
        setSelectedUser(data);
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h1>🔐 Admin Panel</h1>
        <button 
          onClick={async () => {
            await logout();
            navigate('/login');
          }}
          className="logout-btn"
        >
          Logout
        </button>
      </div>

      {/* Stats Dashboard */}
      <div className="admin-stats">
        <div className="stat-card">
          <h3>Total Users</h3>
          <p className="stat-number">{stats.totalUsers || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Active Users</h3>
          <p className="stat-number active">{stats.activeUsers || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Trial Users</h3>
          <p className="stat-number trial">{stats.trialUsers || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Expired Users</h3>
          <p className="stat-number expired">{stats.expiredUsers || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Total Windows</h3>
          <p className="stat-number">{stats.totalWindows || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Total Revenue</h3>
          <p className="stat-number revenue">{formatCurrency(stats.totalRevenue || 0)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="admin-filters">
        <input
          type="text"
          placeholder="Search users by email, name, or company..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="search-input"
        />
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="filter-select"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="trial">Trial</option>
          <option value="expired">Expired</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="admin-table-container">
        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Name</th>
                <th>Company</th>
                <th>Subscription</th>
                <th>Status</th>
                <th>End Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td>{user.email}</td>
                  <td>{user.fullName}</td>
                  <td>{user.companyName || '-'}</td>
                  <td>
                    <span className={`badge tier-${user.subscriptionTier}`}>
                      {user.subscriptionTier.replace('_', ' ')}
                    </span>
                  </td>
                  <td>
                    <span className={`badge status-${user.subscriptionStatus}`}>
                      {user.subscriptionStatus}
                    </span>
                  </td>
                  <td>{formatDate(user.subscriptionEndDate)}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => viewUserDetails(user._id)}
                        className="btn-view"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleUserAction(user._id, 'update', {
                          subscriptionStatus: user.subscriptionStatus === 'active' ? 'expired' : 'active'
                        })}
                        className="btn-toggle"
                      >
                        {user.subscriptionStatus === 'active' ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm('Are you sure you want to delete this user?')) {
                            handleUserAction(user._id, 'delete');
                          }
                        }}
                        className="btn-delete"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
            <span>
              Page {pagination.page} of {pagination.pages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(pagination.pages, p + 1))}
              disabled={currentPage === pagination.pages}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="modal-overlay" onClick={() => setSelectedUser(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>User Details</h2>
              <button onClick={() => setSelectedUser(null)} className="close-btn">×</button>
            </div>
            <div className="modal-body">
              <div className="detail-section">
                <h3>User Information</h3>
                <p><strong>Email:</strong> {selectedUser.user.email}</p>
                <p><strong>Name:</strong> {selectedUser.user.fullName}</p>
                <p><strong>Company:</strong> {selectedUser.user.companyName || '-'}</p>
                <p><strong>Phone:</strong> {selectedUser.user.phone || '-'}</p>
                <p><strong>Role:</strong> {selectedUser.user.role}</p>
                <p><strong>Email Verified:</strong> {selectedUser.user.isEmailVerified ? 'Yes' : 'No'}</p>
              </div>

              <div className="detail-section">
                <h3>Subscription Information</h3>
                <p><strong>Tier:</strong> {selectedUser.user.subscriptionTier}</p>
                <p><strong>Status:</strong> {selectedUser.user.subscriptionStatus}</p>
                <p><strong>Start Date:</strong> {formatDate(selectedUser.user.subscriptionStartDate)}</p>
                <p><strong>End Date:</strong> {formatDate(selectedUser.user.subscriptionEndDate)}</p>
              </div>

              <div className="detail-section">
                <h3>Usage Statistics</h3>
                <p><strong>Total Windows:</strong> {selectedUser.windowsCount || 0}</p>
                <p><strong>Total Subscriptions:</strong> {selectedUser.subscriptions?.length || 0}</p>
              </div>

              <div className="detail-section">
                <h3>Subscription History</h3>
                {selectedUser.subscriptions && selectedUser.subscriptions.length > 0 ? (
                  <table className="subscription-table">
                    <thead>
                      <tr>
                        <th>Plan</th>
                        <th>Status</th>
                        <th>Price</th>
                        <th>Start Date</th>
                        <th>End Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedUser.subscriptions.map((sub) => (
                        <tr key={sub._id}>
                          <td>{sub.planType}</td>
                          <td>{sub.status}</td>
                          <td>{formatCurrency(sub.price)}</td>
                          <td>{formatDate(sub.startDate)}</td>
                          <td>{formatDate(sub.endDate)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p>No subscription history</p>
                )}
              </div>

              <div className="modal-actions">
                <button
                  onClick={() => {
                    const newStatus = selectedUser.user.subscriptionStatus === 'active' ? 'expired' : 'active';
                    handleUserAction(selectedUser.user._id, 'update', {
                      subscriptionStatus: newStatus
                    });
                  }}
                  className="btn-primary"
                >
                  {selectedUser.user.subscriptionStatus === 'active' ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this user?')) {
                      handleUserAction(selectedUser.user._id, 'delete');
                    }
                  }}
                  className="btn-danger"
                >
                  Delete User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;

