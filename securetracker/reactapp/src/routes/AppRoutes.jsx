import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import ProtectedRoute from '../components/Auth/Common/ProtectedRoute';
import LoginPage from '../pages/LoginPage';
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
        <Route path="/mfa" element={<MFAPage />} />
        <Route path="/signup" element={<LoginPage />} />
        
        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/assets"
          element={
            <ProtectedRoute requiredPermission="read">
              <AssetOnboarding />
            </ProtectedRoute>
          }
        />
        <Route
          path="/asset-onboarding"
          element={
            <ProtectedRoute requiredPermission="manage_assets">
              <AssetOnboarding />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tracking"
          element={
            <ProtectedRoute requiredPermission="view_tracking">
              <LiveTracking />
            </ProtectedRoute>
          }
        />
        
        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  );
};

export default AppRoutes;

