import React from "react";
import { Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ProtectedRoute from "../components/Auth/Common/ProtectedRoute";

/* Public pages */
import LandingPage from "../pages/LandingPage.jsx";
import LoginPage from "../pages/LoginPage";
import Signup from "../components/Auth/Signup/Signup";
import MFAPage from "../pages/MFAPage";

/* Admin pages */
import AdminDashboard from "../pages/Admin/AdminDashboard";
import AdminAnnouncements from "../pages/Admin/AdminAnnouncements";

/* Client dashboard pages ✅ NEW */
import ClientHome from "../pages/Client/ClientHome";
import ClientUsers from "../pages/Client/ClientUsers";
import ClientRoles from "../pages/Client/ClientRoles";
import ClientAssetOnboard from "../pages/Client/ClientAssetOnboard";
import ClientAssetMovement from "../pages/Client/ClientAssetMovement";

/* User pages */
import AssetOnboarding from "../pages/AssetOnboarding";
import LiveTracking from "../pages/LiveTracking";
import Onboarding from "../pages/Onboarding";

/* Layout */
import Sidebar from "../components/Auth/Layout/Sidebar/Sidebar.jsx";
import Navbar from "../components/Auth/Layout/Navbar/Navbar.jsx";

/* =========================
   ROLE-BASED LAYOUT
========================= */
const RoleLayout = () => {
  const { user } = useAuth();

  const roleClass =
    user?.role?.toLowerCase() === "admin" ? "admin-mode" : "viewer-mode";

  return (
    <div className={`layout-root ${roleClass}`}>
      <Navbar />
      <Sidebar />

      <div className="layout-main">
        <div className="layout-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

/* =========================
   SMART DEFAULT REDIRECT
========================= */
const DefaultRedirect = () => {
  const location = useLocation();
  const { user } = useAuth();

  const accessToken =
    localStorage.getItem("access_token") || localStorage.getItem("token");

  const mfaVerified = localStorage.getItem("mfa_verified") === "true";

  if (accessToken && mfaVerified) {
    if (user?.role?.toLowerCase() === "admin") {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/assets" replace />;
  }

  const tempToken =
    localStorage.getItem("temp_token") ||
    localStorage.getItem("pending_access_token");

  if (tempToken && !mfaVerified) {
    return <Navigate to="/mfa" replace state={{ from: location }} />;
  }

  return <Navigate to="/login" replace />;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* PUBLIC */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/mfa" element={<MFAPage />} />

      {/* PROTECTED */}
      <Route element={<RoleLayout />}>
        {/* ADMIN */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute requiredPermission="admin:access">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/announcements"
          element={
            <ProtectedRoute requiredPermission="admin:access">
              <AdminAnnouncements />
            </ProtectedRoute>
          }
        />

        {/* ✅ CLIENT DASHBOARD ROUTES */}
        <Route
          path="/client/:clientCode/home"
          element={
            <ProtectedRoute requiredPermission="admin:access">
              <ClientHome />
            </ProtectedRoute>
          }
        />

        <Route
          path="/client/:clientCode/users"
          element={
            <ProtectedRoute requiredPermission="admin:access">
              <ClientUsers />
            </ProtectedRoute>
          }
        />

        <Route
          path="/client/:clientCode/roles"
          element={
            <ProtectedRoute requiredPermission="admin:access">
              <ClientRoles />
            </ProtectedRoute>
          }
        />

        <Route
          path="/client/:clientCode/asset-onboard"
          element={
            <ProtectedRoute requiredPermission="admin:access">
              <ClientAssetOnboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/client/:clientCode/asset-movement"
          element={
            <ProtectedRoute requiredPermission="admin:access">
              <ClientAssetMovement />
            </ProtectedRoute>
          }
        />

        {/* USER ROUTES (keep if needed) */}
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
          path="/tracking"
          element={
            <ProtectedRoute requiredPermission="tracking:read">
              <LiveTracking />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* FALLBACK */}
      <Route path="*" element={<DefaultRedirect />} />
    </Routes>
  );
};

export default AppRoutes;