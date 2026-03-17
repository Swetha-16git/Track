import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { jwtDecode } from "jwt-decode"; // ✅ make sure you installed: npm i jwt-decode --legacy-peer-deps

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

const getStoredToken = () =>
  localStorage.getItem('token') ||
  localStorage.getItem('access_token') ||
  null;

const safeDecode = (token) => {
  try {
    return jwtDecode(token);
  } catch (e) {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(getStoredToken());
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);

  // If you keep MFA flags in UI
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaToken, setMfaToken] = useState(null);

  /**
   * ✅ refreshAuth: reads token from localStorage and derives user from JWT payload
   * This ensures admin/viewer UI differs correctly every login.
   */
  const refreshAuth = useCallback(() => {
    const storedToken = getStoredToken();

    if (!storedToken) {
      setToken(null);
      setUser(null);
      return;
    }

    const decoded = safeDecode(storedToken);
    if (!decoded) {
      // token is invalid
      localStorage.removeItem('token');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');

      setToken(null);
      setUser(null);
      return;
    }

    // ✅ Build user from JWT (SOURCE OF TRUTH)
    const derivedUser = {
      id: decoded.sub,
      username: decoded.username,
      email: decoded.email,
      role: decoded.role, // ✅ key for RBAC UI
      organisation_id: decoded.organisation_id,
      type: decoded.type,
    };

    setToken(storedToken);
    setUser(derivedUser);

    // optional: keep a synced user object for debugging/UI display
    localStorage.setItem('user', JSON.stringify(derivedUser));
  }, []);

  useEffect(() => {
    refreshAuth();
    setLoading(false);
  }, [refreshAuth]);

  // ✅ Listen for updates triggered in same tab (your MFA.jsx dispatches this)
  useEffect(() => {
    const onAuthRefresh = () => refreshAuth();
    window.addEventListener('auth-refresh', onAuthRefresh);
    return () => window.removeEventListener('auth-refresh', onAuthRefresh);
  }, [refreshAuth]);

  // ✅ Also listen for localStorage updates across tabs/windows
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === 'token' || e.key === 'access_token' || e.key === 'user') {
        refreshAuth();
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [refreshAuth]);

  // Keep (optional) for your current flow
  const login = async (credentials) => {
    setMfaRequired(true);
    setMfaToken(credentials?.tempToken || 'temp_mfa_token');
    return { mfaRequired: true };
  };

  // Keep (optional) — your MFA.jsx promotes tokens and then calls refreshAuth
  const verifyMfa = async () => {
    refreshAuth();
    return { ok: true };
  };

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

    window.dispatchEvent(new Event('auth-refresh'));
  };

  // ✅ MUST match backend permissions.py strings
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
      viewer: [
        'assets:read',
        'tracking:read',
      ],
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
    login,
    verifyMfa,
    logout,
    hasPermission,
    isAuthenticated: !!token,
    refreshAuth, // ✅ so MFA.jsx can call it safely
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;