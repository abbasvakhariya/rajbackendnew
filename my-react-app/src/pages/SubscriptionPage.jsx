import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { subscriptionAPI } from '../utils/api';
import './SubscriptionPage.css';

const SubscriptionPage = () => {
  const { user, refreshUser } = useAuth();
  const [plans, setPlans] = useState({});
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadSubscriptionData();
  }, []);

  const loadSubscriptionData = async () => {
    try {
      const [plansRes, subscriptionRes] = await Promise.all([
        subscriptionAPI.getPlans(),
        subscriptionAPI.getCurrentSubscription()
      ]);

      if (plansRes.success) {
        setPlans(plansRes.plans);
      }

      if (subscriptionRes.success) {
        setCurrentSubscription(subscriptionRes.subscription);
      }
    } catch (error) {
      console.error('Error loading subscription data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planType) => {
    try {
      setProcessing(true);
      const response = await subscriptionAPI.createPayment(planType);

      if (response.success) {
        // Store subscription ID for callback
        localStorage.setItem('pendingSubscriptionId', response.subscriptionId);
        // Redirect to PayPal
        window.location.href = response.approvalUrl;
      } else {
        alert('Failed to create payment. Please try again.');
        setProcessing(false);
      }
    } catch (error) {
      console.error('Error creating payment:', error);
      alert('Error creating payment. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  // Handle PayPal callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentId = urlParams.get('paymentId');
    const payerId = urlParams.get('PayerID');
    const subscriptionId = localStorage.getItem('pendingSubscriptionId');

    if (paymentId && payerId && subscriptionId) {
      executePayment(paymentId, payerId, subscriptionId);
    }
  }, []);

  const executePayment = async (paymentId, payerId, subscriptionId) => {
    try {
      setProcessing(true);
      const response = await subscriptionAPI.executePayment(paymentId, payerId, subscriptionId);

      if (response.success) {
        alert('Payment successful! Your subscription is now active.');
        localStorage.removeItem('pendingSubscriptionId');
        refreshUser();
        window.history.replaceState({}, '', '/subscription');
      } else {
        alert('Payment failed. Please try again.');
      }
    } catch (error) {
      console.error('Error executing payment:', error);
      alert('Error processing payment. Please contact support.');
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isSubscriptionActive = () => {
    if (!user) return false;
    const now = new Date();
    const endDate = new Date(user.subscriptionEndDate);
    return (user.subscriptionStatus === 'active' || user.subscriptionStatus === 'trial') && endDate > now;
  };

  if (loading) {
    return (
      <div className="subscription-page">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="subscription-page">
      <div className="subscription-container">
        <div className="subscription-header">
          <h1>Subscription Plans</h1>
          <p>Choose the plan that works best for you</p>
        </div>

        {currentSubscription && (
          <div className="current-subscription">
            <h2>Current Subscription</h2>
            <div className="subscription-info">
              <p><strong>Plan:</strong> {currentSubscription.tier.replace('_', ' ')}</p>
              <p><strong>Status:</strong> 
                <span className={`status-badge ${currentSubscription.status}`}>
                  {currentSubscription.status}
                </span>
              </p>
              <p><strong>End Date:</strong> {formatDate(currentSubscription.endDate)}</p>
            </div>
          </div>
        )}

        {!isSubscriptionActive() && (
          <div className="subscription-warning">
            <p>⚠️ Your subscription has expired. Please subscribe to continue using the service.</p>
          </div>
        )}

        <div className="plans-grid">
          {Object.entries(plans).map(([planType, plan]) => (
            <div key={planType} className="plan-card">
              <div className="plan-header">
                <h3>{planType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</h3>
                <div className="plan-price">
                  <span className="currency">₹</span>
                  <span className="amount">{plan.price}</span>
                </div>
              </div>
              <div className="plan-features">
                <ul>
                  <li>✓ Unlimited Windows</li>
                  <li>✓ All Features Access</li>
                  <li>✓ Cutting List Generation</li>
                  <li>✓ PDF Export</li>
                  <li>✓ Priority Support</li>
                </ul>
              </div>
              <button
                onClick={() => handleSubscribe(planType)}
                disabled={processing || (isSubscriptionActive() && currentSubscription?.tier === planType)}
                className="subscribe-btn"
              >
                {processing
                  ? 'Processing...'
                  : isSubscriptionActive() && currentSubscription?.tier === planType
                  ? 'Current Plan'
                  : 'Subscribe'}
              </button>
            </div>
          ))}
        </div>

        <div className="subscription-footer">
          <p>All payments are processed securely through PayPal</p>
          <p>Questions? Contact support at support@windowmanagement.com</p>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;

