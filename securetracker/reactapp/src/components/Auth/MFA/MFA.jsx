import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import OtpTimer from './OtpTimer';
import './MFA.css';
import assetImg from '../../../assets/loader.jpg';
import { useAuth } from '../../../context/AuthContext'; // ✅ ADD THIS

const MFA = () => {
  const [selectedMethod, setSelectedMethod] = useState('sms');
  const [otp, setOtp] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const navigate = useNavigate();
  const { refreshAuth } = useAuth(); // ✅ ADD THIS

  const mfaMethods = [
    { id: 'sms', name: 'SMS OTP', icon: '📱', description: 'Receive a one-time password via SMS' },
    { id: 'email', name: 'Email OTP', icon: '📧', description: 'Receive a one-time password via email' },
    { id: 'faceid', name: 'Face ID', icon: '👤', description: 'Authenticate using facial recognition' },
    { id: 'fingerprint', name: 'Fingerprint', icon: '👆', description: 'Authenticate using fingerprint' },
    { id: 'ad', name: 'Active Directory', icon: '🏢', description: 'Authenticate via Active Directory' },
  ];

  const handleMethodSelect = (methodId) => {
    setSelectedMethod(methodId);
    setError('');
    setOtp('');
    setOtpSent(false);
  };

  /**
   * ✅ Promote pending tokens after MFA is completed
   * IMPORTANT FIX:
   * - store token in BOTH keys: token + access_token
   * - ensure user exists in localStorage
   * - dispatch auth-refresh so AuthContext updates immediately
   */
  const promotePendingTokens = () => {
    const pendingAccess =
      localStorage.getItem('pending_access_token') ||
      localStorage.getItem('access_token') ||
      localStorage.getItem('temp_token');

    const pendingRefresh = localStorage.getItem('pending_refresh_token');

    if (!pendingAccess) {
      throw new Error('Session expired. Please login again.');
    }

    // ✅ Store in standardized keys
    localStorage.setItem('access_token', pendingAccess);
    localStorage.setItem('token', pendingAccess);

    if (pendingRefresh) localStorage.setItem('refresh_token', pendingRefresh);

    // User derived from JWT decode in AuthContext; no localStorage 'user' needed

    // cleanup
    localStorage.removeItem('pending_access_token');
    localStorage.removeItem('pending_refresh_token');
    localStorage.removeItem('temp_token');

    localStorage.setItem('mfa_verified', 'true');

    // ✅ notify AuthContext + same tab
    window.dispatchEvent(new Event('auth-refresh'));
    refreshAuth();
  };

  // Simulate sending OTP (until backend OTP APIs are integrated)
  const handleSendOtp = async () => {
    setError('');

    if (selectedMethod === 'sms' && !phoneNumber.trim()) {
      setError('Please enter your phone number');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setOtpSent(true);
    }, 800);
  };

  const handleVerify = async () => {
    setError('');
    setLoading(true);

    try {
      // ✅ Require 6 digits
      if ((selectedMethod === 'sms' || selectedMethod === 'email') && otp.length !== 6) {
        throw new Error('Please enter a valid 6-digit OTP');
      }

      // ✅ DEMO OTP (fixed)
      if (selectedMethod === 'sms' || selectedMethod === 'email') {
        if (otp !== '123456') {
          throw new Error('Invalid OTP. Use 123456');
        }
      }

      promotePendingTokens();

      // ✅ Use replace so ProtectedRoute doesn't push you back
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricAuth = async () => {
    setLoading(true);
    setError('');

    try {
      promotePendingTokens();
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Biometric verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdAuth = async () => {
    setLoading(true);
    setError('');

    try {
      promotePendingTokens();
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Active Directory authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    // ✅ Clear EVERYTHING auth-related so login starts fresh
    localStorage.removeItem('token');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('pending_access_token');
    localStorage.removeItem('pending_refresh_token');
    localStorage.removeItem('temp_token');
    localStorage.removeItem('user');
    localStorage.setItem('mfa_verified', 'false');

    window.dispatchEvent(new Event('auth-refresh'));
    refreshAuth();

    navigate('/login', { replace: true });
  };

  return (
    <div className="st-page">
      <div className="st-shell st-shell--mfa">
        {/* LEFT */}
        <div className="st-left">
          <div className="st-brand">
            <span className="st-dot" />
            <div>
              <h1 className="st-app">SecureTracker</h1>
              <p className="st-app-sub">Complete verification to securely access your dashboard</p>
            </div>
          </div>

          <img src={assetImg} alt="SecureTracker" className="st-asset-img" />

          <div className="st-chips">
            <span className="st-chip">Secure login</span>
            <span className="st-chip">MFA enabled</span>
            <span className="st-chip">Org access</span>
          </div>
        </div>

        {/* RIGHT */}
        <div className="st-right">
          <div className="mfa-panel">
            <div className="mfa-header">
              <h1>Multi‑Factor Authentication</h1>
              <p>Enter OTP 123456 to continue</p>
            </div>

            <div className="mfa-methods">
              {mfaMethods.map((method) => (
                <button
                  key={method.id}
                  className={`mfa-method-btn ${selectedMethod === method.id ? 'selected' : ''}`}
                  onClick={() => handleMethodSelect(method.id)}
                  type="button"
                >
                  <span className="method-icon">{method.icon}</span>
                  <span className="method-name">{method.name}</span>
                </button>
              ))}
            </div>

            <div className="mfa-content">
              {/* SMS OTP */}
              {selectedMethod === 'sms' && (
                <div className="mfa-form">
                  {!otpSent ? (
                    <>
                      <p className="mfa-description">Enter your phone number to receive OTP</p>

                      <div className="form-group">
                        <label htmlFor="phone">Phone Number</label>
                        <input
                          type="tel"
                          id="phone"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder="+1 234 567 8900"
                          disabled={loading}
                        />
                      </div>

                      <button className="mfa-action-btn" onClick={handleSendOtp} disabled={loading} type="button">
                        {loading ? 'Sending…' : 'Send OTP'}
                      </button>
                    </>
                  ) : (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleVerify();
                      }}
                    >
                      <p className="mfa-description">Enter OTP (123456)</p>
                      <OtpTimer onResend={handleSendOtp} />

                      <div className="form-group">
                        <label htmlFor="otp">Enter OTP</label>
                        <input
                          type="text"
                          id="otp"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          placeholder="123456"
                          maxLength={6}
                          required
                          disabled={loading}
                        />
                      </div>

                      <button type="submit" className="mfa-action-btn" disabled={loading || otp.length !== 6}>
                        {loading ? 'Verifying…' : 'Verify OTP'}
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* EMAIL OTP */}
              {selectedMethod === 'email' && (
                <div className="mfa-form">
                  {!otpSent ? (
                    <>
                      <p className="mfa-description">Click below to receive OTP in your email</p>
                      <button className="mfa-action-btn" onClick={handleSendOtp} disabled={loading} type="button">
                        {loading ? 'Sending…' : 'Send OTP'}
                      </button>
                    </>
                  ) : (
                    <>
                      <p className="mfa-description">Enter OTP (123456)</p>
                      <OtpTimer onResend={handleSendOtp} />

                      <div className="form-group">
                        <label htmlFor="email-otp">Enter OTP</label>
                        <input
                          type="text"
                          id="email-otp"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          placeholder="123456"
                          maxLength={6}
                          required
                          disabled={loading}
                        />
                      </div>

                      <button className="mfa-action-btn" type="button" onClick={handleVerify} disabled={loading || otp.length !== 6}>
                        {loading ? 'Verifying…' : 'Verify OTP'}
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* Face ID */}
              {selectedMethod === 'faceid' && (
                <div className="mfa-form biometric-form">
                  <div className="biometric-icon">👤</div>
                  <p className="mfa-description">Use Face ID to authenticate</p>
                  <button className="mfa-action-btn" onClick={handleBiometricAuth} disabled={loading} type="button">
                    {loading ? 'Authenticating…' : 'Scan Face'}
                  </button>
                </div>
              )}

              {/* Fingerprint */}
              {selectedMethod === 'fingerprint' && (
                <div className="mfa-form biometric-form">
                  <div className="biometric-icon">👆</div>
                  <p className="mfa-description">Use Fingerprint to authenticate</p>
                  <button className="mfa-action-btn" onClick={handleBiometricAuth} disabled={loading} type="button">
                    {loading ? 'Authenticating…' : 'Scan Fingerprint'}
                  </button>
                </div>
              )}

              {/* Active Directory */}
              {selectedMethod === 'ad' && (
                <div className="mfa-form biometric-form">
                  <div className="biometric-icon">🏢</div>
                  <p className="mfa-description">Authenticate via Active Directory</p>
                  <button className="mfa-action-btn" onClick={handleAdAuth} disabled={loading} type="button">
                    {loading ? 'Authenticating…' : 'Login with AD'}
                  </button>
                </div>
              )}
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="mfa-footer">
              <button className="back-btn" onClick={handleBackToLogin} type="button">
                ← Back to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MFA;