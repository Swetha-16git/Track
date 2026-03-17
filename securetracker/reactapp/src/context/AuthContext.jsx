import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaToken, setMfaToken] = useState(null);

  useEffect(() => {
    // Check for existing token and validate
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      } catch (e) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    // This would call the actual API
    // For now, simulate the MFA requirement
    setMfaRequired(true);
    setMfaToken(credentials.tempToken || 'temp_mfa_token');
    return { mfaRequired: true };
  };

  const verifyMfa = async (mfaCode, mfaMethod) => {
    // Verify MFA and get final token
    // This would call the actual API
    const mockUser = {
      id: '1',
      username: 'demo_user',
      email: 'demo@securetracker.com',
      organization: 'Demo Organization',
      role: 'admin'
    };
    const mockToken = 'jwt_token_' + Date.now();
    
    setUser(mockUser);
    setToken(mockToken);
    setMfaRequired(false);
    setMfaToken(null);
    
    localStorage.setItem('token', mockToken);
    localStorage.setItem('user', JSON.stringify(mockUser));
    
    return { user: mockUser, token: mockToken };
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setOrganization(null);
    setMfaRequired(false);
    setMfaToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

const hasPermission = (permission) => {
    if (!user || !user.role) return false;
    
    const rolePermissions = {
      admin: ['read', 'write', 'delete', 'manage_users', 'manage_assets', 'view_tracking'],
      viewer: ['read', 'view_tracking'],
      guest: ['read']
    };
    
    return rolePermissions[user.role]?.includes(permission) || false;
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
    isAuthenticated: !!token
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

