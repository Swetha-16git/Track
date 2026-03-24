import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css';
import assetImg from '../../../assets/loader.png';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const clearAuth = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('pending_access_token');
    localStorage.removeItem('pending_refresh_token');
    localStorage.removeItem('temp_token');
    localStorage.setItem('mfa_verified', 'false');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const baseUrl = process.env.REACT_APP_API_BASE_URL;
      if (!baseUrl) throw new Error('Missing REACT_APP_API_BASE_URL in .env');

      clearAuth();

      const res = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      let data = {};
      try { data = await res.json(); } catch (_) {}

      if (!res.ok) throw new Error(data?.detail || data?.message || 'Login failed');

      const mfaRequired = data?.mfa_required ?? data?.mfaRequired;
      const tempToken = data?.temp_token || data?.tempToken;

      if (mfaRequired && tempToken) {
        localStorage.setItem('temp_token', tempToken);
        localStorage.setItem('mfa_verified', 'false');
        navigate('/mfa');
        return;
      }

      const access = data?.access_token || data?.accessToken;
      const refresh = data?.refresh_token || data?.refreshToken;

      if (access) {
        localStorage.setItem('pending_access_token', access);
        if (refresh) localStorage.setItem('pending_refresh_token', refresh);

        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');

        localStorage.setItem('mfa_verified', 'false');
        navigate('/mfa');
        return;
      }

      throw new Error('Login response missing MFA info and tokens');
    } catch (err) {
      setError(err?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="st-page">
      <div className="st-shell">

        {/* LEFT (White full canvas content) */}
        <div className="st-left">
          <div className="st-brand">
            <span className="st-dot" />
            <div>
              <h1 className="st-app">SecureTracker</h1>
              <p className="st-app-sub">Secure Vehicle Asset Tracking</p>
            </div>
          </div>

          <div className="st-visual">
            <img src={assetImg} alt="Vehicle asset" className="st-asset-img" />
          </div>

          <div className="st-left-bottom">
            <div className="st-chips">
              <span className="st-chip">Real‑time tracking</span>
              <span className="st-chip">Org access</span>
              <span className="st-chip">MFA‑ready</span>
            </div>

            <div className="st-powered">
              <span>powered by</span>
              <strong>L&amp;T‑NxT</strong>
            </div>
          </div>
        </div>

        {/* RIGHT (Grey panel sits inside white canvas) */}
        <div className="st-right">
          <div className="st-right-card">
            <h2 className="st-title">Member Login</h2>
            <p className="st-subtitle">Enter employee credentials to login.</p>

            {error && <div className="st-error">{error}</div>}

            <form onSubmit={handleSubmit} className="st-form">
              <label className="st-label">Username / Email</label>
              <input
                className="st-input"
                placeholder="Enter username or email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={loading}
              />

              <label className="st-label">Password</label>
              <input
                className="st-input"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />

              <button className="st-btn" disabled={loading}>
                {loading ? 'Signing in…' : 'Sign In'}
              </button>

              <div className="st-forgot">
                <Link to="/forgot-password" className="st-forgot-link">
                  Forgot Password
                </Link>
              </div>
            </form>

            <Link to="/signup" className="st-create-btn">
              Create Account <span className="st-create-arrow">›</span>
            </Link>

            <div className="st-legal" />
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;