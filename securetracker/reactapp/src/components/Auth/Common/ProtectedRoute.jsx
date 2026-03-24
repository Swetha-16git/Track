import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import Loader from './Loader';

const ProtectedRoute = ({ children, requiredPermission }) => {
  const { loading, hasPermission, refreshAuth } = useAuth();
  const location = useLocation();

  // ✅ Always read truth from storage (MFA flow)
  const accessToken =
    localStorage.getItem('access_token') ||
    localStorage.getItem('token');

  const tempToken =
    localStorage.getItem('temp_token') ||
    localStorage.getItem('pending_access_token');

  const mfaVerified = localStorage.getItem('mfa_verified') === 'true';

  /**
   * ✅ IMPORTANT:
   * After MFA, storage becomes valid but AuthContext can be stale for 1 render.
   * Force refresh when we see valid token + mfa_verified=true.
   */
  useEffect(() => {
    if (!loading && accessToken && mfaVerified) {
      refreshAuth?.();
      window.dispatchEvent(new Event('auth-refresh'));
    }
  }, [loading, accessToken, mfaVerified, refreshAuth]);

  // ✅ While app is initializing
  if (loading) {
    return (
      <div className="protected-route-loading">
        <Loader />
      </div>
    );
  }

  /**
   * ✅ If no access token:
   * - If temp token exists => user is in MFA stage => go /mfa (not login)
   * - Else => go /login
   */
  if (!accessToken) {
    if (tempToken) {
      return <Navigate to="/mfa" state={{ from: location }} replace />;
    }
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  /**
   * ✅ If access token exists but MFA not verified => go /mfa
   */
  if (!mfaVerified) {
    return <Navigate to="/mfa" state={{ from: location }} replace />;
  }

  /**
   * ✅ Permission check AFTER token + MFA verification
   */
  if (requiredPermission && typeof hasPermission === 'function') {
    if (!hasPermission(requiredPermission)) {
      return (
        <div className="access-denied">
          <h2>Access Denied</h2>
          <p>You don't have permission to access this resource.</p>
        </div>
      );
    }
  }

  return children;
};

export default ProtectedRoute;