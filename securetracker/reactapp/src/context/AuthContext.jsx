import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

// ✅ Prefer access_token first (your MFA saves this)
const getStoredToken = () =>
  localStorage.getItem('access_token') ||
  localStorage.getItem('token') ||
  null;

const getTempToken = () =>
  localStorage.getItem('temp_token') ||
  localStorage.getItem('pending_access_token') ||
  null;

const getMfaVerified = () => localStorage.getItem('mfa_verified') === 'true';

const safeDecode = (token) => {
  try {
    return jwtDecode(token);
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(getStoredToken());
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);

  // MFA UI flags (optional but kept since your app uses it)
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaToken, setMfaToken] = useState(getTempToken());

  /**
   * ✅ refreshAuth: single source of truth
   * Rules:
   * - temp_token exists => MFA stage (NOT authenticated)
   * - access_token exists + mfa_verified=true => authenticated
   */
  const refreshAuth = useCallback(() => {
    const storedToken = getStoredToken();
    const temp = getTempToken();
    const mfaOk = getMfaVerified();

    // Keep MFA flags updated for UI
    setMfaToken(temp);
    setMfaRequired(!!temp && !mfaOk);

    // If MFA not verified, treat as logged out (even if token exists)
    if (!storedToken || !mfaOk) {
      setToken(null);
      setUser(null);
      return;
    }

    const decoded = safeDecode(storedToken);
    if (!decoded) {
      localStorage.removeItem('token');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      localStorage.setItem('mfa_verified', 'false');

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
      type: decoded.type,
    };

    setToken(storedToken);
    setUser(derivedUser);
    localStorage.setItem('user', JSON.stringify(derivedUser));
  }, []);

  // ✅ Init
  useEffect(() => {
    refreshAuth();
    setLoading(false);
  }, [refreshAuth]);

  // ✅ Same-tab refresh (your MFA dispatches this)
  useEffect(() => {
    const onAuthRefresh = () => refreshAuth();
    window.addEventListener('auth-refresh', onAuthRefresh);
    return () => window.removeEventListener('auth-refresh', onAuthRefresh);
  }, [refreshAuth]);

  // ✅ Cross-tab refresh
  useEffect(() => {
    const onStorage = (e) => {
      const keys = new Set([
        'token',
        'access_token',
        'refresh_token',
        'temp_token',
        'pending_access_token',
        'pending_refresh_token',
        'mfa_verified',
        'user',
      ]);
      if (keys.has(e.key)) refreshAuth();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [refreshAuth]);

  // ✅ Auth only when token + MFA verified
  const isAuthenticated = useMemo(() => {
    return !!token && getMfaVerified() === true;
  }, [token]);

  const logout = () => {
    setUser(null);
    setToken(null);
    setOrganization(null);
    setMfaRequired(false);
    setMfaToken(null);

    localStorage.removeItem('token');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('pending_access_token');
    localStorage.removeItem('pending_refresh_token');
    localStorage.removeItem('temp_token');
    localStorage.removeItem('user');
    localStorage.removeItem('testRole');
    localStorage.removeItem('role');
    localStorage.setItem('mfa_verified', 'false');

    window.dispatchEvent(new Event('auth-refresh'));
  };

  // ✅ MUST match backend permission strings
  const hasPermission = (permission) => {
    const role = String(user?.role || '').toLowerCase();
    if (!role) return false;

    const rolePermissions = {
      admin: [
        'users:read', 'users:write', 'users:delete',
        'assets:read', 'assets:write', 'assets:delete',
        'tracking:read', 'tracking:write',
        'roles:read', 'roles:write',
        'organisations:read', 'organisations:write',
        'settings:read', 'settings:write',
      ],
      viewer: ['assets:read', 'tracking:read'],
    };

    return rolePermissions[role]?.includes(permission) || false;
  };

  const value = {
    user,
    token,
    organization,
    loading,

    // MFA flags (optional)
    mfaRequired,
    mfaToken,
    mfaVerified: getMfaVerified(),

    // actions
    logout,
    refreshAuth,

    // RBAC
    hasPermission,

    // auth
    isAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;