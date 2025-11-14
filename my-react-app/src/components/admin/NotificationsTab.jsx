import { useState, useEffect } from 'react';
import { adminAPI } from '../../utils/api';
import './AdminTabs.css';

const NotificationsTab = () => {
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notificationData, setNotificationData] = useState({
    title: '',
    message: '',
    category: 'announcement'
  });
  const [showSendModal, setShowSendModal] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getUsers({ limit: 1000 });
      if (data.success) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendNotification = async (e) => {
    e.preventDefault();
    if (selectedUsers.length === 0) {
      alert('Please select at least one user');
      return;
    }
    if (!notificationData.title || !notificationData.message) {
      alert('Please fill in title and message');
      return;
    }

    try {
      const data = await adminAPI.sendNotificationToUsers(
        selectedUsers,
        notificationData.title,
        notificationData.message,
        notificationData.category
      );
      if (data.success) {
        alert(`Notification sent successfully to ${data.count} user(s)!`);
        setShowSendModal(false);
        setSelectedUsers([]);
        setNotificationData({
          title: '',
          message: '',
          category: 'announcement'
        });
      }
    } catch (error) {
      alert('Error sending notification: ' + (error.message || 'Unknown error'));
    }
  };

  const toggleUserSelection = (userId) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  const selectAllUsers = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(u => u._id));
    }
  };

  return (
    <div className="notifications-tab">
      <div className="tab-header">
        <h2>Notifications & Communication</h2>
        <p className="tab-subtitle">Send notifications to users</p>
      </div>

      <div className="tab-toolbar">
        <div className="toolbar-right">
          <button onClick={() => setShowSendModal(true)} className="btn-primary">+ Send Notification</button>
        </div>
      </div>

      {showSendModal && (
        <div className="modal-overlay" onClick={() => setShowSendModal(false)}>
          <div className="modal-content large-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Send Notification</h2>
              <button onClick={() => setShowSendModal(false)} className="close-btn">×</button>
            </div>
            <form onSubmit={handleSendNotification} className="modal-body">
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  required
                  value={notificationData.title}
                  onChange={(e) => setNotificationData({ ...notificationData, title: e.target.value })}
                  className="form-input"
                  placeholder="Notification title"
                />
              </div>
              <div className="form-group">
                <label>Message *</label>
                <textarea
                  required
                  rows="5"
                  value={notificationData.message}
                  onChange={(e) => setNotificationData({ ...notificationData, message: e.target.value })}
                  className="form-input"
                  placeholder="Notification message"
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select
                  value={notificationData.category}
                  onChange={(e) => setNotificationData({ ...notificationData, category: e.target.value })}
                  className="form-input"
                >
                  <option value="announcement">Announcement</option>
                  <option value="subscription">Subscription</option>
                  <option value="payment">Payment</option>
                  <option value="system">System</option>
                  <option value="support">Support</option>
                </select>
              </div>

              <div className="form-group">
                <label>Select Users ({selectedUsers.length} selected)</label>
                <div className="users-selection">
                  <div className="selection-header">
                    <button
                      type="button"
                      onClick={selectAllUsers}
                      className="btn-sm btn-secondary"
                    >
                      {selectedUsers.length === users.length ? 'Deselect All' : 'Select All'}
                    </button>
                    <span>{selectedUsers.length} of {users.length} selected</span>
                  </div>
                  <div className="users-list">
                    {users.map(user => (
                      <label key={user._id} className="user-checkbox">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user._id)}
                          onChange={() => toggleUserSelection(user._id)}
                        />
                        <span>{user.fullName} ({user.email})</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowSendModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Send Notification</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="info-card">
        <h3>📧 Notification Features</h3>
        <ul>
          <li>Send notifications to selected users or all users</li>
          <li>Notifications are sent via email and in-app</li>
          <li>Choose from different notification categories</li>
          <li>Track notification delivery status</li>
        </ul>
      </div>
    </div>
  );
};

export default NotificationsTab;
