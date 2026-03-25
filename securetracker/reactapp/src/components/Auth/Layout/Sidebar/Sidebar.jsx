import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../../../context/AuthContext";
import "./Sidebar.css";

const Sidebar = () => {
  const { hasPermission } = useAuth();
  const [isOpen, setIsOpen] = useState(true);

  const toggleSidebar = () => setIsOpen(prev => !prev);

  const menu = [
    {
      path: "/dashboard",
      label: "Dashboard",
      icon: "🏠",
      perm: "assets:read",
    },
    {
      path: "/onboarding",
      label: "Onboarding",
      icon: "🧩",
      perm: "assets:write",
    },
    {
      path: "/assets",
      label: "View Assets",
      icon: "📊",
      perm: "assets:read",
    },
    {
      path: "/live-tracking",
      label: "Live Tracking",
      icon: "📍",
      perm: "assets:read",
    },
    {
      path: "/profile",
      label: "Profile",
      icon: "👤",
      perm: "assets:read",
    },
  ];

  return (
    <aside className={`sidebar ${isOpen ? "open" : "closed"}`}>
      {/* Sidebar Header */}
      <div className="sidebar-header">
        {isOpen && <span className="sidebar-title">Asset Insight</span>}
        <button className="sidebar-toggle" onClick={toggleSidebar}>
          ☰
        </button>
      </div>

      {/* Sidebar Menu */}
      <ul className="sidebar-menu">
        {menu
          .filter(item => hasPermission(item.perm))
          .map(item => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? "active" : ""}`
                }
              >
                <span className="icon">{item.icon}</span>
                {isOpen && <span className="label">{item.label}</span>}
              </NavLink>
            </li>
          ))}
      </ul>
    </aside>
  );
};

export default Sidebar;