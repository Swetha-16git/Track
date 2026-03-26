import React from "react";
import { Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ProtectedRoute from "../components/Auth/Common/ProtectedRoute";

import LandingPage from "../pages/LandingPage.jsx";
import LoginPage from "../pages/LoginPage";
import Signup from "../components/Auth/Signup/Signup";
import MFAPage from "../pages/MFAPage";

import Dashboard from "../pages/Dashboard";
import AssetOnboarding from "../pages/AssetOnboarding";
import LiveTracking from "../pages/LiveTracking";
import Onboarding from "../pages/Onboarding";

/* ✅ Role-based container ONLY for protected pages */
const RoleLayout = () => {
  const { user } = useAuth();

  const roleClass =
    user?.role?.toLowerCase() === "admin" ? "admin-mode" : "viewer-mode";

  return (
    <div className={`app-container ${roleClass}`}>
      <Outlet />
    </div>
  );
};

/* ✅ Smart fallback: if authenticated -> dashboard else login */
const DefaultRedirect = () => {
  const location = useLocation();

  const accessToken =
    localStorage.getItem("access_token") || localStorage.getItem("token");

  const mfaVerified = localStorage.getItem("mfa_verified") === "true";

  // If user is already verified, go dashboard
  if (accessToken && mfaVerified) {
    return <Navigate to="/dashboard" replace state={{ from: location }} />;
  }

  // If user is in MFA stage, go MFA
  const tempToken =
    localStorage.getItem("temp_token") ||
    localStorage.getItem("pending_access_token");

  if (tempToken && !mfaVerified) {
    return <Navigate to="/mfa" replace state={{ from: location }} />;
  }

  // Otherwise login
  return <Navigate to="/login" replace state={{ from: location }} />;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* =========================
          PUBLIC ROUTES
      ========================= */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/mfa" element={<MFAPage />} />

      {/* =========================
          PROTECTED ROUTES (WITH CONTAINER)
      ========================= */}
      <Route element={<RoleLayout />}>
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/onboarding"
          element={
            <ProtectedRoute requiredPermission="assets:write">
              <Onboarding />
            </ProtectedRoute>
          }
        />
        <Route
          path="/assets"
          element={
            <ProtectedRoute requiredPermission="assets:read">
              <AssetOnboarding />
            </ProtectedRoute>
          }
        />

        <Route
          path="/asset-onboarding"
          element={
            <ProtectedRoute requiredPermission="assets:write">
              <AssetOnboarding />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tracking"
          element={
            <ProtectedRoute requiredPermission="tracking:read">
              <LiveTracking />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* ✅ ONE wildcard only (important!) */}
      <Route path="*" element={<DefaultRedirect />} />
    </Routes>
  );
};

export default AppRoutes;