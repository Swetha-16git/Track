import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import Loader from './Loader';

const ProtectedRoute = ({ children, requiredPermission }) => {
  const { isAuthenticated, loading, hasPermission } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="protected-route-loading">
        <Loader />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div className="access-denied">
        <h2>Access Denied</h2>
        <p>You don't have permission to access this resource.</p>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;

