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

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(getStoredToken());
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);

  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaToken, setMfaToken] = useState(getTempToken());

  const refreshAuth = useCallback(() => {
    const storedToken = getStoredToken();
    const temp = getTempToken();
    const mfaOk = getMfaVerified();

    setMfaToken(temp);
    setMfaRequired(!!temp && !mfaOk);

    // ✅ If MFA not verified => treat as not authenticated
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

    const derivedUser = {
      id: decoded.sub,
      username: decoded.username,
      email: decoded.email,
      role: decoded.role,
      organisation_id: decoded.organisation_id,
    };

    setToken(storedToken);
    setUser(derivedUser);
    localStorage.setItem("user", JSON.stringify(derivedUser));
  }, []);

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

  const isAuthenticated = useMemo(() => {
    return !!token && getMfaVerified() === true;
  }, [token]);

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

  const hasPermission = (permission) => {
    const role = String(user?.role || "").toLowerCase();
    if (!role) return false;

    const rolePermissions = {
      admin: [
        "users:read", "users:write", "users:delete",
        "assets:read", "assets:write", "assets:delete",
        "tracking:read", "tracking:write",
        "roles:read", "roles:write",
        "organisations:read", "organisations:write",
        "settings:read", "settings:write",
      ],
      viewer: ["assets:read", "tracking:read"],
    };

    return rolePermissions[role]?.includes(permission) || false;
  };

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