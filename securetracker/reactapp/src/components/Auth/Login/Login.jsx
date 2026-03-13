import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import './Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login({ username, password });
      if (result.mfaRequired) {
        navigate('/mfa');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdLogin = () => {
    // Simulate Active Directory login
    navigate('/mfa');
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <h1>Secure Tracker</h1>
          <p>Vehicle Asset Management System</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="username">Username or Email</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In with Password'}
          </button>
        </form>

        <div className="divider">
          <span>or continue with</span>
        </div>

        <div className="mfa-options">
          <button type="button" className="mfa-btn ad-btn" onClick={handleAdLogin}>
            <span className="mfa-icon">🏢</span>
            Active Directory
          </button>
          
          <button type="button" className="mfa-btn" onClick={() => navigate('/mfa')}>
            <span className="mfa-icon">📱</span>
            SMS OTP
          </button>
          
          <button type="button" className="mfa-btn" onClick={() => navigate('/mfa')}>
            <span className="mfa-icon">👤</span>
            Face ID
          </button>
          
          <button type="button" className="mfa-btn" onClick={() => navigate('/mfa')}>
            <span className="mfa-icon">👆</span>
            Fingerprint
          </button>
        </div>

        <div className="login-footer">
          <p>
            Don't have an account? <Link to="/signup">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

