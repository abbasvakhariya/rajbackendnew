import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMemo } from 'react';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, user, checkSubscription } = useAuth();
  const location = useLocation();

  const redirectPath = useMemo(() => {
    if (loading) return null;
    
    if (!isAuthenticated) {
      return '/login';
    }
    
    // Allow access to subscription page even if expired
    if (location.pathname === '/subscription') {
      return null;
    }
    
    // ONLY allow admin panel access to the specific email - subscription doesn't matter
    const ADMIN_EMAIL = 'abbasvakhariya00@gmail.com';
    const isAdminUser = user?.email && user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
    
    if (location.pathname === '/admin' && isAdminUser) {
      return null;
    }
    
    // Block admin panel access for everyone else, even with subscription
    if (location.pathname === '/admin' && !isAdminUser) {
      return '/dashboard';
    }
    
    // Check subscription status
    const hasActiveSubscription = checkSubscription();
    if (!hasActiveSubscription) {
      return '/subscription';
    }
    
    return null;
  }, [loading, isAuthenticated, user, location.pathname, checkSubscription]);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px',
        color: '#6b7280'
      }}>
        Loading...
      </div>
    );
  }

  if (redirectPath) {
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

export default ProtectedRoute;

