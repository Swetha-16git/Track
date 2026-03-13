import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Signup.css';
import assetImg from '../../../assets/loader.jpg';

const Signup = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    organization: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      const baseUrl = process.env.REACT_APP_API_BASE_URL;

      const payload = {
        email: formData.email.trim(),
        username: formData.username.trim(),
        password: formData.password,
        full_name: formData.username.trim(),
        phone: formData.phoneNumber.trim(),
        organisation_name: formData.organization.trim(),
      };

      const res = await fetch(`${baseUrl}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.detail || 'Signup failed');

      navigate('/login');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="st-page">
      <div className="st-shell st-shell--signup">
        {/* LEFT */}
        <div className="st-left">
          <div className="st-brand">
            <span className="st-dot" />
            <div>
              <h1 className="st-app">SecureTracker</h1>
              <p className="st-app-sub">
                Onboard your organization & track vehicle assets securely
              </p>
            </div>
          </div>

          {/* ✅ Image same as Login */}
          <img
            src={assetImg}
            alt="SecureTracker vehicle asset"
            className="st-asset-img"
          />

          {/* ✅ Chips pinned bottom */}
          <div className="st-chips">
            <span className="st-chip">Create account</span>
            <span className="st-chip">Org access</span>
            <span className="st-chip">MFA‑ready</span>
          </div>
        </div>

        {/* RIGHT */}
        <div className="st-right">
          <h2 className="st-title">Create Account</h2>
          <p className="st-subtitle">
            Create your SecureTracker account to onboard and manage vehicle assets.
          </p>

          {error && <div className="st-error">{error}</div>}

          <form onSubmit={handleSubmit} className="st-form">
            <label className="st-label">Username</label>
            <input
              className="st-input"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />

            <label className="st-label">Email Address</label>
            <input
              className="st-input"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <label className="st-label">Organization</label>
            <input
              className="st-input"
              name="organization"
              value={formData.organization}
              onChange={handleChange}
              required
            />

            <label className="st-label">Mobile Number</label>
            <input
              className="st-input"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              required
            />

            <label className="st-label">Password</label>
            <input
              className="st-input"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />

            <label className="st-label">Re‑type Password</label>
            <input
              className="st-input"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />

            <div className="st-actions">
              <button
                type="button"
                className="st-cancel"
                onClick={() => navigate('/login')}
              >
                Cancel
              </button>

              <button type="submit" className="st-btn" disabled={loading}>
                {loading ? 'Creating…' : 'Create Account'}
              </button>
            </div>
          </form>

          <div className="st-footer">
            <span>Already have an account?</span>
            <Link to="/login" className="st-link">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;