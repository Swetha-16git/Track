import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../context/AuthContext';
import { assetService } from '../../../../services/assetService';
import './Navbar.css';

const Navbar = ({ toggleSidebar }) => {
  const { user, logout, hasPermission } = useAuth();
  const navigate = useNavigate();

  const [assetsDropdownOpen, setAssetsDropdownOpen] = useState(false);
  const [assetStatuses, setAssetStatuses] = useState([]);
  const assetsDropdownRef = useRef(null);

  // ✅ Load assets and derive statuses
  useEffect(() => {
    if (!hasPermission('assets:read')) return;

    const loadStatuses = async () => {
      try {
        const assets = await assetService.getAllAssets();

        const uniqueStatuses = [
          ...new Set(assets.map(a => a.status).filter(Boolean)),
        ];

        setAssetStatuses(uniqueStatuses);
      } catch (e) {
        console.error('Failed to load asset statuses', e);
      }
    };

    loadStatuses();
  }, [hasPermission]);

  // ✅ Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (assetsDropdownRef.current && !assetsDropdownRef.current.contains(e.target)) {
        setAssetsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <button onClick={toggleSidebar} className="menu-toggle">☰</button>

        <Link to="/dashboard" className="navbar-brand">
          🚗 SecureTracker
        </Link>

        {hasPermission('assets:read') && (
          <div className="nav-item-dropdown" ref={assetsDropdownRef}>
            <button onClick={() => setAssetsDropdownOpen(p => !p)}>
              Assets ▼
            </button>

            {assetsDropdownOpen && (
              <div className="nav-dropdown-menu">
                <button
                  onClick={() => {
                    setAssetsDropdownOpen(false);
                    navigate('/assets');
                  }}
                >
                  📦 All Assets
                </button>

                {assetStatuses.map(status => (
                  <button
                    key={status}
                    onClick={() => {
                      setAssetsDropdownOpen(false);
                      navigate(`/assets?status=${status}`);
                    }}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="navbar-right">
        <span>{user?.username}</span>
        <button onClick={logout}>Logout</button>
      </div>
    </nav>
  );
};

export default Navbar;