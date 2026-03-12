import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication Services
export const authService = {
  // Login with username and password
  login: async (username, password) => {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  },

  // Signup new user
  signup: async (userData) => {
    const response = await api.post('/auth/signup', userData);
    return response.data;
  },

  // Verify MFA
  verifyMfa: async (mfaToken, mfaCode, mfaMethod) => {
    const response = await api.post('/auth/verify-mfa', {
      mfa_token: mfaToken,
      mfa_code: mfaCode,
      mfa_method: mfaMethod,
    });
    return response.data;
  },

  // Send OTP for SMS
  sendSmsOtp: async (phoneNumber) => {
    const response = await api.post('/auth/send-sms-otp', { phone_number: phoneNumber });
    return response.data;
  },

  // Verify SMS OTP
  verifySmsOtp: async (phoneNumber, otp) => {
    const response = await api.post('/auth/verify-sms-otp', {
      phone_number: phoneNumber,
      otp_code: otp,
    });
    return response.data;
  },

  // Face ID authentication
  verifyFaceId: async (faceData) => {
    const response = await api.post('/auth/verify-faceid', { face_data: faceData });
    return response.data;
  },

  // Fingerprint/biometric authentication
  verifyFingerprint: async (fingerprintData) => {
    const response = await api.post('/auth/verify-fingerprint', {
      fingerprint_data: fingerprintData,
    });
    return response.data;
  },

  // Active Directory authentication
  adLogin: async (adToken) => {
    const response = await api.post('/auth/ad-login', { ad_token: adToken });
    return response.data;
  },

  // Logout
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  // Refresh token
  refreshToken: async () => {
    const response = await api.post('/auth/refresh');
    return response.data;
  },
};

export default authService;

