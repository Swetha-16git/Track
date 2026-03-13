import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import OtpTimer from './OtpTimer';
import './MFA.css';

const MFA = () => {
  const [selectedMethod, setSelectedMethod] = useState('sms');
  const [otp, setOtp] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const { verifyMfa } = useAuth();
  const navigate = useNavigate();

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

  const handleSendOtp = async () => {
    if (!phoneNumber && (selectedMethod === 'sms')) {
      setError('Please enter your phone number');
      return;
    }
    setLoading(true);
    setError('');
    
    // Simulate sending OTP
    setTimeout(() => {
      setLoading(false);
      setOtpSent(true);
    }, 1500);
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await verifyMfa(otp, selectedMethod);
      if (result.token) {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricAuth = async (type) => {
    setLoading(true);
    setError('');

    try {
      // Simulate biometric authentication
      if (type === 'faceid') {
        // In real implementation, this would use WebAuthn or a biometric API
        const mockFaceData = { verified: true, timestamp: Date.now() };
        const result = await verifyMfa(JSON.stringify(mockFaceData), 'faceid');
        if (result.token) {
          navigate('/dashboard');
        }
      } else if (type === 'fingerprint') {
        const mockFingerprintData = { verified: true, timestamp: Date.now() };
        const result = await verifyMfa(JSON.stringify(mockFingerprintData), 'fingerprint');
        if (result.token) {
          navigate('/dashboard');
        }
      }
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
      // Simulate AD authentication
      const mockAdData = { authenticated: true, timestamp: Date.now() };
      const result = await verifyMfa(JSON.stringify(mockAdData), 'ad');
      if (result.token) {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Active Directory authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mfa-container">
      <div className="mfa-box">
        <div className="mfa-header">
          <h1>Multi-Factor Authentication</h1>
          <p>Select your verification method</p>
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
                    />
                  </div>
                  <button 
                    className="mfa-action-btn" 
                    onClick={handleSendOtp}
                    disabled={loading}
                  >
                    {loading ? 'Sending...' : 'Send OTP'}
                  </button>
                </>
              ) : (
                <form onSubmit={handleVerify}>
                  <p className="mfa-description">Enter the OTP sent to your phone</p>
                  <OtpTimer onResend={handleSendOtp} />
                  <div className="form-group">
                    <label htmlFor="otp">Enter OTP</label>
                    <input
                      type="text"
                      id="otp"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="Enter 6-digit OTP"
                      maxLength={6}
                      required
                    />
                  </div>
                  <button 
                    type="submit" 
                    className="mfa-action-btn"
                    disabled={loading || otp.length !== 6}
                  >
                    {loading ? 'Verifying...' : 'Verify OTP'}
                  </button>
                </form>
              )}
            </div>
          )}

          {selectedMethod === 'email' && (
            <div className="mfa-form">
              <p className="mfa-description">Enter the OTP sent to your email</p>
              <div className="form-group">
                <label htmlFor="email-otp">Enter OTP</label>
                <input
                  type="text"
                  id="email-otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter 6-digit OTP"
                  maxLength={6}
                  required
                />
              </div>
              <button 
                className="mfa-action-btn" 
                onClick={handleVerify}
                disabled={loading || otp.length !== 6}
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
            </div>
          )}

          {selectedMethod === 'faceid' && (
            <div className="mfa-form biometric-form">
              <div className="biometric-icon">👤</div>
              <p className="mfa-description">Use Face ID to authenticate</p>
              <button 
                className="mfa-action-btn biometric-btn"
                onClick={() => handleBiometricAuth('faceid')}
                disabled={loading}
              >
                {loading ? 'Authenticating...' : 'Scan Face'}
              </button>
            </div>
          )}

          {selectedMethod === 'fingerprint' && (
            <div className="mfa-form biometric-form">
              <div className="biometric-icon">👆</div>
              <p className="mfa-description">Use Fingerprint to authenticate</p>
              <button 
                className="mfa-action-btn biometric-btn"
                onClick={() => handleBiometricAuth('fingerprint')}
                disabled={loading}
              >
                {loading ? 'Authenticating...' : 'Scan Fingerprint'}
              </button>
            </div>
          )}

          {selectedMethod === 'ad' && (
            <div className="mfa-form">
              <div className="biometric-icon">🏢</div>
              <p className="mfa-description">Authenticate via Active Directory</p>
              <button 
                className="mfa-action-btn ad-auth-btn"
                onClick={handleAdAuth}
                disabled={loading}
              >
                {loading ? 'Authenticating...' : 'Login with AD'}
              </button>
            </div>
          )}
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="mfa-footer">
          <button className="back-btn" onClick={() => navigate('/login')}>
            ← Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default MFA;

