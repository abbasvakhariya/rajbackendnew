const API_URL = import.meta.env.VITE_API_URL || 'https://windowmanagementsystem.onrender.com/api';

// Helper function to get auth token
const getToken = () => {
  return localStorage.getItem('token');
};

// Helper function to get device ID
const getDeviceId = () => {
  let deviceId = localStorage.getItem('deviceId');
  if (!deviceId) {
    deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('deviceId', deviceId);
  }
  return deviceId;
};

// Base fetch function with error handling
const apiRequest = async (endpoint, options = {}) => {
  const token = getToken();
  const deviceId = getDeviceId();

  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      'x-device-id': deviceId,
      ...options.headers
    }
  };

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);
    
    // Handle cases where response is not JSON
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      throw new Error(`Server returned non-JSON response: ${text}`);
    }

    if (!response.ok) {
      // Handle device conflict
      if (data.code === 'DEVICE_CONFLICT') {
        throw new Error('DEVICE_CONFLICT');
      }
      // Handle user not found - clear token
      if (data.code === 'USER_NOT_FOUND' || response.status === 401 || response.status === 404) {
        localStorage.removeItem('token');
        throw new Error(data.message || 'User not found. Please login again.');
      }
      throw new Error(data.message || 'Request failed');
    }

    return data;
  } catch (error) {
    if (error.message === 'DEVICE_CONFLICT') {
      throw error;
    }
    // If it's a network error, provide better message
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      console.error('API Error: Cannot connect to server. Check if backend is running.');
      throw new Error('Cannot connect to server. Please check your connection.');
    }
    console.error('API Error:', error);
    throw error;
  }
};

// Auth API
export const authAPI = {
  register: (userData) => apiRequest('/auth/register', {
    method: 'POST',
    body: userData
  }),

  verifyEmail: (email, otp) => apiRequest('/auth/verify-email', {
    method: 'POST',
    body: { email, otp }
  }),

  resendOTP: (email) => apiRequest('/auth/resend-otp', {
    method: 'POST',
    body: { email }
  }),

  requestLoginOTP: (email) => apiRequest('/auth/request-login-otp', {
    method: 'POST',
    body: { email }
  }),

  login: (email, otp) => apiRequest('/auth/login', {
    method: 'POST',
    body: {
      email,
      otp,
      deviceId: getDeviceId()
    }
  }),

  logout: () => apiRequest('/auth/logout', {
    method: 'POST'
  }),

  getCurrentUser: () => apiRequest('/auth/me')
};

// Settings API
export const settingsAPI = {
  getSettings: () => apiRequest('/settings'),
  updateSettings: (settings) => apiRequest('/settings', {
    method: 'PUT',
    body: settings
  })
};

// Windows API
export const windowsAPI = {
  getWindows: () => apiRequest('/windows'),
  createWindow: (windowData) => apiRequest('/windows', {
    method: 'POST',
    body: windowData
  }),
  updateWindow: (id, windowData) => apiRequest(`/windows/${id}`, {
    method: 'PUT',
    body: windowData
  }),
  deleteWindow: (id) => apiRequest(`/windows/${id}`, {
    method: 'DELETE'
  })
};

// Subscription API
export const subscriptionAPI = {
  getPlans: () => apiRequest('/subscription/plans'),
  getCurrentSubscription: () => apiRequest('/subscription/current'),
  createPayment: (planType) => apiRequest('/subscription/create-payment', {
    method: 'POST',
    body: { planType }
  }),
  executePayment: (paymentId, payerId, subscriptionId) => apiRequest('/subscription/execute-payment', {
    method: 'POST',
    body: { paymentId, payerId, subscriptionId }
  }),
  cancelSubscription: () => apiRequest('/subscription/cancel', {
    method: 'POST'
  })
};

// Admin API
export const adminAPI = {
  getUsers: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/admin/users${queryString ? `?${queryString}` : ''}`);
  },
  getUserDetails: (id) => apiRequest(`/admin/users/${id}`),
  updateUser: (id, data) => apiRequest(`/admin/users/${id}`, {
    method: 'PUT',
    body: data
  }),
  deleteUser: (id) => apiRequest(`/admin/users/${id}`, {
    method: 'DELETE'
  }),
  getStats: () => apiRequest('/admin/stats'),
  getSubscriptions: () => apiRequest('/admin/subscriptions'),
  // Enhanced admin endpoints
  bulkUserAction: (userIds, action, data) => apiRequest('/admin/users/bulk', {
    method: 'POST',
    body: { userIds, action, data }
  }),
  getUserActivity: (userId) => apiRequest(`/admin/users/${userId}/activity`),
  addUserNote: (userId, note) => apiRequest(`/admin/users/${userId}/notes`, {
    method: 'POST',
    body: { note }
  }),
  getPayments: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/admin/payments${queryString ? `?${queryString}` : ''}`);
  },
  refundPayment: (id, notes) => apiRequest(`/admin/payments/${id}/refund`, {
    method: 'POST',
    body: { notes }
  }),
  getAnalytics: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/admin/analytics/overview${queryString ? `?${queryString}` : ''}`);
  },
  getSettings: () => apiRequest('/admin/settings'),
  updateSetting: (key, value) => apiRequest(`/admin/settings/${key}`, {
    method: 'PUT',
    body: { value }
  }),
  sendNotification: (userIds, title, message, category) => apiRequest('/admin/notifications/send', {
    method: 'POST',
    body: { userIds, title, message, category }
  }),
  getSupportTickets: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/admin/support/tickets${queryString ? `?${queryString}` : ''}`);
  },
  updateSupportTicket: (id, data) => apiRequest(`/admin/support/tickets/${id}`, {
    method: 'PUT',
    body: data
  }),
  getAuditLogs: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/admin/audit-logs${queryString ? `?${queryString}` : ''}`);
  },
  exportUsers: () => apiRequest('/admin/export/users'),
  exportPayments: () => apiRequest('/admin/export/payments'),
  createUser: (userData) => apiRequest('/admin/users/create', {
    method: 'POST',
    body: userData
  }),
  getPlans: () => apiRequest('/admin/plans'),
  updatePlans: (plans) => apiRequest('/admin/plans', {
    method: 'PUT',
    body: { plans }
  }),
  sendNotificationToUsers: (userIds, title, message, category) => apiRequest('/admin/notifications/send', {
    method: 'POST',
    body: { userIds, title, message, category }
  })
};

export default apiRequest;

