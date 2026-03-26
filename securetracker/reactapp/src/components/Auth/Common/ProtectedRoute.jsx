import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import Loader from "./Loader";

const ProtectedRoute = ({ children, requiredPermission }) => {
  const { loading, hasPermission, refreshAuth } = useAuth();
  const location = useLocation();

  const accessToken =
    localStorage.getItem("access_token") ||
    localStorage.getItem("token");

  // ✅ ONLY temp_token is valid for MFA stage
  const tempToken = localStorage.getItem("temp_token");

  const mfaVerified = localStorage.getItem("mfa_verified") === "true";

  // ✅ After MFA completes, AuthContext can be stale for 1 render
  useEffect(() => {
    if (!loading && accessToken && mfaVerified) {
      refreshAuth?.();
      window.dispatchEvent(new Event("auth-refresh"));
    }
  }, [loading, accessToken, mfaVerified, refreshAuth]);

  if (loading) {
    return (
      <div className="protected-route-loading">
        <Loader />
      </div>
    );
  }

  /**
   * ✅ MFA route rules:
   * - /mfa is allowed only if temp_token exists
   * - if not, force login
   */
  if (location.pathname === "/mfa") {
    if (!tempToken) {
      return <Navigate to="/login" replace />;
    }
    return children;
  }

  /**
   * ✅ Not authenticated:
   * - if temp token exists => user is in MFA stage => push to /mfa
   * - else => login
   */
  if (!accessToken) {
    if (tempToken) {
      return <Navigate to="/mfa" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  /**
   * ✅ Token exists but MFA not completed => push to /mfa
   */
  if (!mfaVerified) {
    return <Navigate to="/mfa" replace />;
  }

  /**
   * ✅ Permission check
   */
  if (requiredPermission && typeof hasPermission === "function") {
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