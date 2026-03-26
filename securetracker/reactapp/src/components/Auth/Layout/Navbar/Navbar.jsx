import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../context/AuthContext';
import './Navbar.css';

const Navbar = ({ toggleSidebar }) => {
  const { user, logout, hasPermission } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [assetsDropdownOpen, setAssetsDropdownOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const assetsDropdownRef = useRef(null);
  const profileRef = useRef(null);

  // ✅ First letter avatar
  const userInitial = user?.username?.charAt(0)?.toUpperCase() || 'U';

  // ✅ Fixed status options (as per your requirement)
  const statusOptions = useMemo(
    () => [
      { key: 'active', label: 'Active' },
      { key: 'inactive', label: 'Inactive' },
      { key: 'maintenance', label: 'Maintenance' },
      { key: 'stolen', label: 'Stolen' },
    ],
    []
  );

  // ✅ Current selected status from URL: /assets?status=active
  const currentStatus = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return (params.get('status') || '').toLowerCase();
  }, [location.search]);

  // ✅ Show assets dropdown for any reasonable "can view assets" permission
  // (UI only; backend must still enforce authorization)
  const canSeeAssetsDropdown = useMemo(() => {
    const hp = hasPermission?.bind(null);
    return (
      (hp && hp('assets:read')) ||
      (hp && hp('read')) ||
      (hp && hp('manage_assets')) ||
      (hp && hp('assets:manage'))
    );
  }, [hasPermission]);

  // ✅ Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (assetsDropdownRef.current && !assetsDropdownRef.current.contains(e.target)) {
        setAssetsDropdownOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ✅ Close dropdowns when route changes (prevents stuck open)
  useEffect(() => {
    setAssetsDropdownOpen(false);
    setProfileOpen(false);
  }, [location.pathname, location.search]);

  const onLogout = () => {
    logout();
    navigate('/login');
  };

  const goAssetsAll = () => {
    setAssetsDropdownOpen(false);
    navigate('/assets');
  };

  const goAssetsStatus = (status) => {
    setAssetsDropdownOpen(false);
    navigate(`/assets?status=${encodeURIComponent(status)}`);
  };

  return (
    <nav className="navbar">
      {/* LEFT */}
      <div className="navbar-left">
       

        <Link to="/dashboard" className="navbar-brand">
          🚛 SecureTracker
        </Link>

        {/* ✅ Assets dropdown */}
        {canSeeAssetsDropdown && (
          <div className="nav-item-dropdown" ref={assetsDropdownRef}>
            <button
              className="nav-button"
              type="button"
              onClick={() => setAssetsDropdownOpen((p) => !p)}
              aria-expanded={assetsDropdownOpen}
            >
              Assets <span className="nav-caret">▼</span>
            </button>

            {assetsDropdownOpen && (
              <div className="nav-dropdown-menu" role="menu">
                <button
                  type="button"
                  className={`nav-dd-item ${location.pathname === '/assets' && !currentStatus ? 'is-active' : ''}`}
                  onClick={goAssetsAll}
                >
                  <span className="status-dot status-all" />
                  All Assets
                </button>

                <div className="nav-dd-sep" />

                {statusOptions.map((opt) => (
                  <button
                    type="button"
                    key={opt.key}
                    className={`nav-dd-item ${currentStatus === opt.key ? 'is-active' : ''}`}
                    onClick={() => goAssetsStatus(opt.key)}
                  >
                    <span className={`status-dot status-${opt.key}`} />
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* RIGHT – PROFILE */}
      <div className="navbar-right" ref={profileRef}>
        <button
          className="profile-btn"
          type="button"
          onClick={() => setProfileOpen((p) => !p)}
          aria-expanded={profileOpen}
        >
          <div className="profile-initial">{userInitial}</div>
          <span className="profile-name">{user?.username || 'User'}</span>
          <span className="profile-caret">▼</span>
        </button>

        {profileOpen && (
  <div className="profile-dropdown">
    <div className="profile-card">
      <div className="profile-avatar-wrapper">
        <div className="profile-initial profile-initial-lg">
          {userInitial}
        </div>
      </div>

      <div className="profile-info">
        <div className="profile-fullname">
          {user?.username}
        </div>
        <div className="profile-role">
          {user?.role || 'User'}
        </div>
      </div>
    </div>

    <button onClick={() => navigate('/profile')}>
      My Profile
    </button>
    <button className="logout-item" onClick={onLogout}>
      Logout
    </button>
  </div>
)}

      </div>
    </nav>
  );
};

export default Navbar;