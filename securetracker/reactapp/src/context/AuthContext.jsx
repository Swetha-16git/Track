import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};

/* ================= UTILITIES ================= */

const getStoredToken = () =>
  localStorage.getItem("access_token") ||
  localStorage.getItem("token") ||
  null;

const getTempToken = () => localStorage.getItem("temp_token") || null;

const getMfaVerified = () => localStorage.getItem("mfa_verified") === "true";

const safeDecode = (t) => {
  try {
    return jwtDecode(t);
  } catch {
    return null;
  }
};

/**
 * ✅ Normalize role from JWT payload.
 * Supports:
 * - decoded.role = "admin" / "viewer"
 * - decoded.role = "ADMIN" / "VIEWER"
 * - decoded.role_display = "ADMIN" / "VIEWER"
 */
const normalizeRole = (decoded) => {
  const raw =
    decoded?.role ??
    decoded?.role_name ??
    decoded?.role_display ??
    decoded?.user_role ??
    decoded?.userRole ??
    "";

  const s = String(raw).trim();
  if (!s) return "viewer";

  const lower = s.toLowerCase();

  // accept multiple shapes
  if (lower === "admin" || lower === "role_admin" || s === "ADMIN") return "admin";
  if (lower === "viewer" || lower === "role_viewer" || s === "VIEWER") return "viewer";

  // fallback
  return "viewer";
};

/**
 * ✅ Normalize permissions list from JWT payload.
 * Supports:
 * - decoded.permissions = [...]
 * - decoded.perms = [...]
 */
const normalizePermissions = (decoded) => {
  const perms = decoded?.permissions || decoded?.perms || [];
  return Array.isArray(perms) ? perms : [];
};

/* ================= PROVIDER ================= */

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(getStoredToken());
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);

  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaToken, setMfaToken] = useState(getTempToken());

  /* ================= AUTH REFRESH ================= */

  const refreshAuth = useCallback(() => {
    const storedToken = getStoredToken();
    const temp = getTempToken();
    const mfaOk = getMfaVerified();

    setMfaToken(temp);
    setMfaRequired(!!temp && !mfaOk);

    // ❌ MFA not verified → unauthenticated
    if (!storedToken || !mfaOk) {
      setToken(null);
      setUser(null);
      return;
    }

    const decoded = safeDecode(storedToken);
    if (!decoded) {
      localStorage.removeItem("token");
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");
      localStorage.setItem("mfa_verified", "false");

      setToken(null);
      setUser(null);
      return;
    }

    // ✅ derive role + permissions from token correctly
    const role = normalizeRole(decoded);
    const permissions = normalizePermissions(decoded);

    const derivedUser = {
      id: decoded.sub,
      username: decoded.username,
      email: decoded.email,
      role,                  // ✅ "admin" or "viewer"
      permissions,           // ✅ permission array
      organisation_id:
        decoded.organisation_id ??
        decoded.organization_id ??
        decoded.org_id ??
        null,
    };

    setToken(storedToken);
    setUser(derivedUser);
    localStorage.setItem("user", JSON.stringify(derivedUser));
  }, []);

  /* ================= EFFECTS ================= */

  useEffect(() => {
    refreshAuth();
    setLoading(false);
  }, [refreshAuth]);

  useEffect(() => {
    const onAuthRefresh = () => refreshAuth();
    window.addEventListener("auth-refresh", onAuthRefresh);
    return () => window.removeEventListener("auth-refresh", onAuthRefresh);
  }, [refreshAuth]);

  useEffect(() => {
    const onStorage = (e) => {
      const keys = new Set([
        "token",
        "access_token",
        "refresh_token",
        "temp_token",
        "mfa_verified",
        "user",
      ]);
      if (keys.has(e.key)) refreshAuth();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [refreshAuth]);

  /* ================= DERIVED STATE ================= */

  const isAuthenticated = useMemo(() => {
    return !!token && getMfaVerified() === true;
  }, [token]);

  /* ================= LOGOUT ================= */

  const logout = () => {
    setUser(null);
    setToken(null);
    setOrganization(null);
    setMfaRequired(false);
    setMfaToken(null);

    localStorage.removeItem("token");
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("temp_token");
    localStorage.removeItem("user");
    localStorage.setItem("mfa_verified", "false");

    window.dispatchEvent(new Event("auth-refresh"));
  };

  /* ================= PERMISSIONS ================= */

  const hasPermission = (perm) => {
    // ✅ Admin has access to everything
    if (user?.role?.toLowerCase() === "admin") return true;

    const perms = user?.permissions || [];
    return perms.includes(perm);
  };

  /* ================= CONTEXT VALUE ================= */

  const value = {
    user,
    token,
    organization,
    loading,
    mfaRequired,
    mfaToken,
    mfaVerified: getMfaVerified(),
    logout,
    refreshAuth,
    hasPermission,
    isAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;