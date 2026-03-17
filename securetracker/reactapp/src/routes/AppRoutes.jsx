import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import ProtectedRoute from '../components/Auth/Common/ProtectedRoute';

import LoginPage from '../pages/LoginPage';
import Signup from '../components/Auth/Signup/Signup';
import MFAPage from '../pages/MFAPage';

import Dashboard from '../pages/Dashboard';
import AssetOnboarding from '../pages/AssetOnboarding';
import LiveTracking from '../pages/LiveTracking';

const AppRoutes = () => {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/mfa" element={<MFAPage />} />

        {/* Protected Routes */}
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

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  );
};

export default AppRoutes;