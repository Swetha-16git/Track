import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../context/AuthContext';
import './Navbar.css';

const Navbar = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <button className="menu-toggle" onClick={toggleSidebar}>
          <span className="menu-icon">☰</span>
        </button>
        <Link to="/dashboard" className="navbar-brand">
          <span className="brand-icon">🚗</span>
          <span className="brand-text">Secure Tracker</span>
        </Link>
      </div>

      <div className="navbar-center">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search assets, tracking..."
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>
      </div>

      <div className="navbar-right">
        <button className="notification-btn">
          <span>🔔</span>
          <span className="notification-badge">3</span>
        </button>

        <div className="user-dropdown">
          <button 
            className="user-btn"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <div className="user-avatar">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <span className="user-name">{user?.username || 'User'}</span>
            <span className="dropdown-arrow">▼</span>
          </button>

          {dropdownOpen && (
            <div className="dropdown-menu">
              <div className="dropdown-header">
                <p className="user-email">{user?.email || 'user@example.com'}</p>
                <p className="user-org">{user?.organization || 'Organization'}</p>
              </div>
              <div className="dropdown-divider"></div>
              <Link to="/profile" className="dropdown-item">
                <span>👤</span> Profile
              </Link>
              <Link to="/settings" className="dropdown-item">
                <span>⚙️</span> Settings
              </Link>
              <div className="dropdown-divider"></div>
              <button className="dropdown-item logout" onClick={handleLogout}>
                <span>🚪</span> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

