import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import Loader from './Loader';
 
const ProtectedRoute = ({ children, requiredPermission }) => {
  const { isAuthenticated, loading, hasPermission } = useAuth();
  const location = useLocation();
 
  // ✅ Always trust localStorage after MFA
  const accessToken =
    localStorage.getItem('access_token') ||
    localStorage.getItem('token');
 
  const mfaVerified = localStorage.getItem('mfa_verified') === 'true';
 
  // ✅ While AuthContext initializes
  if (loading) {
    return (
      <div className="protected-route-loading">
        <Loader />
      </div>
    );
  }
 
  /**
   * ✅ AUTH CHECK (FIX)
   * If token exists in storage, user IS authenticated
   * even if AuthContext state is stale
   */
  if (!accessToken) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
 
  /**
   * ✅ MFA CHECK
   * Token exists but MFA not done → go MFA
   */
  if (!mfaVerified) {
    return <Navigate to="/mfa" state={{ from: location }} replace />;
  }
 
  /**
   * ✅ PERMISSION CHECK (unchanged)
   */
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div className="access-denied">
        <h2>Access Denied</h2>
        <p>You don't have permission to access this resource.</p>
      </div>
    );
  }
 
  // ✅ All good
  return children;
};
 
export default ProtectedRoute;
 