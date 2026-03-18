import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/Auth/Common/ProtectedRoute";

import LandingPage from "../pages/LandingPage";
import LoginPage from "../pages/LoginPage";
import Signup from "../components/Auth/Signup/Signup";
import MFAPage from "../pages/MFAPage";

import Dashboard from "../pages/Dashboard";
import AssetOnboarding from "../pages/AssetOnboarding";
import LiveTracking from "../pages/LiveTracking";

const AppRoutes = () => {
  return (
    <Routes>
      {/* ✅ Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/mfa" element={<MFAPage />} />

      {/* ✅ Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* ✅ Assets List route (READ) */}
      <Route
        path="/assets"
        element={
          <ProtectedRoute requiredPermission="assets:read">
            <AssetOnboarding />
          </ProtectedRoute>
        }
      />

      {/* ✅ Add/Edit/Delete route (WRITE) */}
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

      {/* ✅ Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;