import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../../../context/AuthContext";
import "./Navbar.css";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  // ✅ First letter avatar
  const userInitial = user?.username?.charAt(0)?.toUpperCase() || "U";

  // ✅ Close profile dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ✅ Close dropdown when route changes
  useEffect(() => {
    setProfileOpen(false);
  }, [location.pathname, location.search]);

  const onLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      {/* LEFT */}
      <div className="navbar-left">
        <Link to="/admin/dashboard" className="navbar-brand">
          🚛 SecureTracker
        </Link>
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
          <span className="profile-name">{user?.username || "User"}</span>
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
                <div className="profile-fullname">{user?.username}</div>
                <div className="profile-role">{user?.role || "User"}</div>
              </div>
            </div>

            {/* <button onClick={() => navigate("/profile")}>My Profile</button> */}
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