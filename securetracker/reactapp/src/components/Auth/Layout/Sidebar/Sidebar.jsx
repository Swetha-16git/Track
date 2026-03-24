import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../../../context/AuthContext";
import "./Sidebar.css";

const Sidebar = () => {
  const { hasPermission } = useAuth();
  const [isOpen, setIsOpen] = useState(true);

  const toggleSidebar = () => setIsOpen(prev => !prev);

  const menu = [
    { path: "/dashboard", label: "Dashboard", icon: "🏠", perm: "assets:read" },
    { path: "/assets", label: "View Assets", icon: "📊", perm: "assets:read" },
    { path: "/asset-onboarding", label: "Add Asset", icon: "➕", perm: "assets:write" },
    { path: "/live-tracking", label: "Live Tracking", icon: "📍", perm: "assets:read" },
    { path: "/profile", label: "Profile", icon: "👤", perm: "assets:read" },
  ];

  return (
    <aside className={`sidebar ${isOpen ? "open" : "closed"}`}>
      {/* ✅ Sidebar header (like screenshot) */}
      <div className="sidebar-header">
        {isOpen && <span className="sidebar-title">Asset Insight</span>}
        <button className="sidebar-toggle" onClick={toggleSidebar}>
          ☰
        </button>
      </div>

      <ul className="sidebar-menu">
        {menu
          .filter(m => hasPermission(m.perm))
          .map(m => (
            <li key={m.path}>
              <NavLink to={m.path} className="sidebar-link">
                <span className="icon">{m.icon}</span>
                {isOpen && <span className="label">{m.label}</span>}
              </NavLink>
            </li>
          ))}
      </ul>
    </aside>
  );
};

export default Sidebar;