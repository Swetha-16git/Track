import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Signup.css';
import assetImg from '../../../assets/loader.png';

const Signup = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
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
      const res = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/auth/signup`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email.trim(),
            username: formData.username.trim(),
            password: formData.password,
            full_name: formData.username.trim(),
            phone: formData.phoneNumber.trim(),
          }),
        }
      );

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

          <div className="st-visual">
            <img src={assetImg} alt="Vehicle asset" className="st-asset-img" />
          </div>

          <div className="st-left-bottom">
            <div className="st-chips">
              <span className="st-chip">Create account</span>
              <span className="st-chip">Org access</span>
              <span className="st-chip">MFA‑ready</span>
            </div>
            <div className="st-powered">
              powered by <strong>L&amp;T‑NxT</strong>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="st-right">
          <div className="st-right-card">
            <h2 className="st-title">Create Account</h2>
            <p className="st-subtitle">
              Create your SecureTracker account to onboard and manage vehicle assets.
            </p>

            {error && <div className="st-error">{error}</div>}

            <form onSubmit={handleSubmit} className="st-form st-form--stack">
              <input className="st-input" name="username" placeholder="Username"
                value={formData.username} onChange={handleChange} required />

              <input className="st-input" type="email" name="email" placeholder="Email address"
                value={formData.email} onChange={handleChange} required />

              <input className="st-input" type="tel" name="phoneNumber" placeholder="Mobile Number"
                value={formData.phoneNumber} onChange={handleChange} required />

              <input className="st-input" type="password" name="password" placeholder="Password"
                value={formData.password} onChange={handleChange} required />

              <input className="st-input" type="password" name="confirmPassword" placeholder="Re‑type Password"
                value={formData.confirmPassword} onChange={handleChange} required />

              <div className="st-actions">
                <button type="button" className="st-cancel"
                  onClick={() => navigate('/login')} disabled={loading}>
                  Cancel
                </button>

                <button type="submit" className="st-btn" disabled={loading}>
                  {loading ? 'Signing up…' : 'Sign Up'}
                </button>
              </div>
            </form>

            <div className="st-footer">
              Already have an account?
              <Link to="/login" className="st-link"> Sign in</Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Signup;