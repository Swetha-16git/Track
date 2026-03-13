import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../context/AuthContext';
import './Navbar.css';

const Navbar = ({ toggleSidebar }) => {
  const { user, logout, hasPermission } = useAuth();
  const navigate = useNavigate();

  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [assetsDropdownOpen, setAssetsDropdownOpen] = useState(false);

  const assetsDropdownRef = useRef(null);
  const userDropdownRef = useRef(null);

  const assetTypes = [
    { type: 'all', label: 'All Assets', icon: '📦' },
    { type: 'car', label: 'Cars', icon: '🚗' },
    { type: 'bike', label: 'Bikes', icon: '🏍️' },
    { type: 'truck', label: 'Trucks', icon: '🚚' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const goToAssets = (type) => {
    setAssetsDropdownOpen(false);
    if (type === 'all') navigate('/assets');
    else navigate(`/assets?type=${type}`);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (assetsDropdownRef.current && !assetsDropdownRef.current.contains(e.target)) {
        setAssetsDropdownOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <button className="menu-toggle" onClick={toggleSidebar} type="button">
          <span className="menu-icon">☰</span>
        </button>

        <Link to="/dashboard" className="navbar-brand">
          <span className="brand-icon">🚗</span>
          <span className="brand-text">Secure Tracker</span>
        </Link>

        {/* ✅ Assets dropdown in navbar */}
        {hasPermission?.('read') && (
          <div className="nav-item-dropdown" ref={assetsDropdownRef}>
            <button
              className={`nav-item-btn ${assetsDropdownOpen ? 'open' : ''}`}
              onClick={() => setAssetsDropdownOpen((p) => !p)}
              type="button"
            >
              <span className="nav-item-icon">🚗</span>
              <span className="nav-item-text">Assets</span>
              <span className="nav-item-arrow">▼</span>
            </button>

            {assetsDropdownOpen && (
              <div className="nav-dropdown-menu">
                {assetTypes.map((t) => (
                  <button
                    key={t.type}
                    className="nav-dropdown-item"
                    onClick={() => goToAssets(t.type)}
                    type="button"
                  >
                    <span className="dd-icon">{t.icon}</span>
                    <span className="dd-text">{t.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="navbar-center">
        <div className="search-box">
          <input type="text" placeholder="Search assets, tracking..." className="search-input" />
          <span className="search-icon">🔍</span>
        </div>
      </div>

      <div className="navbar-right">
        <button className="notification-btn" type="button">
          <span>🔔</span>
          <span className="notification-badge">3</span>
        </button>

        <div className="user-dropdown" ref={userDropdownRef}>
          <button className="user-btn" onClick={() => setUserDropdownOpen(!userDropdownOpen)} type="button">
            <div className="user-avatar">{user?.username?.charAt(0).toUpperCase() || 'U'}</div>
            <span className="user-name">{user?.username || 'User'}</span>
            <span className="dropdown-arrow">▼</span>
          </button>

          {userDropdownOpen && (
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

              <button className="dropdown-item logout" onClick={handleLogout} type="button">
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
// import React, { useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { useAuth } from '../../../../context/AuthContext';
// import './Navbar.css';

// const Navbar = ({ toggleSidebar }) => {
//   const { user, logout } = useAuth();
//   const navigate = useNavigate();
//   const [dropdownOpen, setDropdownOpen] = useState(false);

//   const handleLogout = () => {
//     logout();
//     navigate('/login');
//   };

//   return (
//     <nav className="navbar">
//       <div className="navbar-left">
//         <button className="menu-toggle" onClick={toggleSidebar}>
//           <span className="menu-icon">☰</span>
//         </button>
//         <Link to="/dashboard" className="navbar-brand">
//           <span className="brand-icon">🚗</span>
//           <span className="brand-text">Secure Tracker</span>
//         </Link>
//       </div>

//       <div className="navbar-center">
//         <div className="search-box">
//           <input
//             type="text"
//             placeholder="Search assets, tracking..."
//             className="search-input"
//           />
//           <span className="search-icon">🔍</span>
//         </div>
//       </div>

//       <div className="navbar-right">
//         <button className="notification-btn">
//           <span>🔔</span>
//           <span className="notification-badge">3</span>
//         </button>

//         <div className="user-dropdown">
//           <button 
//             className="user-btn"
//             onClick={() => setDropdownOpen(!dropdownOpen)}
//           >
//             <div className="user-avatar">
//               {user?.username?.charAt(0).toUpperCase() || 'U'}
//             </div>
//             <span className="user-name">{user?.username || 'User'}</span>
//             <span className="dropdown-arrow">▼</span>
//           </button>

//           {dropdownOpen && (
//             <div className="dropdown-menu">
//               <div className="dropdown-header">
//                 <p className="user-email">{user?.email || 'user@example.com'}</p>
//                 <p className="user-org">{user?.organization || 'Organization'}</p>
//               </div>
//               <div className="dropdown-divider"></div>
//               <Link to="/profile" className="dropdown-item">
//                 <span>👤</span> Profile
//               </Link>
//               <Link to="/settings" className="dropdown-item">
//                 <span>⚙️</span> Settings
//               </Link>
//               <div className="dropdown-divider"></div>
//               <button className="dropdown-item logout" onClick={handleLogout}>
//                 <span>🚪</span> Logout
//               </button>
//             </div>
//           )}
//         </div>
//       </div>
//     </nav>
//   );
// };

// export default Navbar;

