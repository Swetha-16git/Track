import React from "react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import AppRoutes from "./routes/AppRoutes";
import "./App.css";

/**
 * Role-based wrapper
 * ❗ IMPORTANT:
 * This component ONLY applies CSS classes.
 * It must NOT navigate or redirect.
 */
const RoleLayout = ({ children }) => {
  const { user } = useAuth();

  const roleClass =
    user?.role?.toLowerCase() === "admin"
      ? "admin-mode"
      : "viewer-mode";

  return <div className={`app-container ${roleClass}`}>{children}</div>;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <RoleLayout>
          {/* ✅ ONLY ROUTES RENDERED HERE */}
          <AppRoutes />
        </RoleLayout>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;