import CryptoJS from 'crypto-js';

// 🔐 Fixed app secret (in prod: use env var + user-derived key)
const SECRET_KEY = 'SecureTrackerApp2024!@#SecureKey456'; // 32 chars for AES-256

// Secure storage helpers
export const secureSet = (key, value) => {
  if (value === null || value === undefined) {
    localStorage.removeItem(key);
    return;
  }
  const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
  const encrypted = CryptoJS.AES.encrypt(stringValue, SECRET_KEY).toString();
  localStorage.setItem(key, encrypted);
};

export const secureGet = (key) => {
  const encrypted = localStorage.getItem(key);
  if (!encrypted) return null;
  try {
    const bytes = CryptoJS.AES.decrypt(encrypted, SECRET_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return decrypted ? JSON.parse(decrypted) : decrypted;
  } catch (e) {
    console.warn(`Failed to decrypt ${key}, clearing...`);
    localStorage.removeItem(key);
    return null;
  }
};

export const secureRemove = (key) => {
  localStorage.removeItem(key);
};

export const secureClearAuth = () => {
  const authKeys = ['token', 'access_token', 'refresh_token', 'user', 'pending_access_token', 'pending_refresh_token', 'temp_token', 'mfa_verified', 'testRole', 'loginUsername', 'loginEmail'];
  authKeys.forEach(secureRemove);
};
