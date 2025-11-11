import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './AuthPages.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('email'); // 'email' or 'otp'
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const { login, requestLoginOTP, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/tools');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!email) {
      setError('Please enter your email');
      return;
    }

    setLoading(true);
    try {
      const response = await requestLoginOTP(email);
      setLoading(false);

      if (response && response.success) {
        setMessage('OTP sent to your email. Please check your inbox.');
        setStep('otp');
        setOtpSent(true);
        setCountdown(60); // 60 seconds countdown
      } else {
        setError(response?.message || 'Failed to send OTP. Please try again.');
        console.error('OTP request failed:', response);
      }
    } catch (err) {
      setLoading(false);
      const errorMessage = err?.message || 'Failed to send OTP. Please check your connection and try again.';
      setError(errorMessage);
      console.error('OTP request error:', err);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const response = await login(email, otp);
      setLoading(false);

      if (response && response.success) {
        navigate('/tools');
      } else if (response?.deviceConflict) {
        setError('Another device is already logged in. Please logout from the other device first.');
      } else {
        setError(response?.message || 'Login failed. Please check your OTP and try again.');
        console.error('Login failed:', response);
      }
    } catch (err) {
      setLoading(false);
      const errorMessage = err?.message || 'Login failed. Please check your connection and try again.';
      setError(errorMessage);
      console.error('Login error:', err);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;
    
    setError('');
    setLoading(true);
    const response = await requestLoginOTP(email);
    setLoading(false);

    if (response.success) {
      setMessage('OTP resent to your email');
      setCountdown(60);
    } else {
      setError(response.message || 'Failed to resend OTP');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1>Window Management System</h1>
          <p>Login to your account</p>
        </div>

        {message && <div className="auth-message">{message}</div>}
        {error && <div className="auth-error">{error}</div>}

        {step === 'email' ? (
          <form onSubmit={handleRequestOTP} className="auth-form">
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                disabled={loading}
              />
            </div>
            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? 'Sending OTP...' : 'Send Login OTP'}
            </button>
            <div className="auth-footer">
              <p>
                Don't have an account?{' '}
                <a href="/register">Register here</a>
              </p>
            </div>
          </form>
        ) : (
          <form onSubmit={handleLogin} className="auth-form">
            <div className="form-group">
              <label>Enter OTP</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Enter 6-digit OTP"
                maxLength={6}
                required
                disabled={loading}
                autoFocus
              />
              <small>OTP sent to: {email}</small>
            </div>
            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
            <div className="auth-footer">
              <p>
                Didn't receive OTP?{' '}
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={countdown > 0 || loading}
                  className="resend-link"
                >
                  {countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
                </button>
              </p>
              <p>
                <a href="#" onClick={(e) => { e.preventDefault(); setStep('email'); setOtp(''); }}>
                  Change email
                </a>
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoginPage;

