import React, { useState, useMemo } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../../../../context/AuthContext";
import "./Sidebar.css";

const Sidebar = () => {
  const { hasPermission } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(true);

  const toggleSidebar = () => setIsOpen((p) => !p);

  // ✅ Detect if we are inside a client dashboard route: /client/:clientCode/...
  const clientCode = useMemo(() => {
    const match = location.pathname.match(/^\/client\/([^/]+)/);
    return match ? decodeURIComponent(match[1]) : null;
  }, [location.pathname]);

  const inClientDashboard = !!clientCode;

  // ✅ Admin menu (when NOT inside client dashboard)
  const adminMenu = [
    { path: "/admin/dashboard", label: "Home", icon: "🏠", perm: "admin:access" },
    { path: "/admin/announcements", label: "Announcements", icon: "📢", perm: "admin:access" },
  ];

  // ✅ Client dashboard menu (shown after clicking a client card)
  const clientMenu = [
    { path: `/client/${clientCode}/home`, label: "Home", icon: "🏠" },
    { path: `/client/${clientCode}/users`, label: "Users", icon: "👤" },
    { path: `/client/${clientCode}/roles`, label: "Roles", icon: "🛡️" },
    { path: `/client/${clientCode}/asset-onboard`, label: "Asset Onboard", icon: "🧩" },
    { path: `/client/${clientCode}/asset-movement`, label: "Asset Movement", icon: "📍" },
  ];

  return (
    <aside className={`sidebar ${isOpen ? "open" : "closed"}`}>
      {/* HEADER */}
      <div className="sidebar-header">
        {isOpen && (
          <span className="sidebar-title">
            {inClientDashboard ? `Client: ${clientCode}` : "Asset Insight"}
          </span>
        )}

        <button
          className="sidebar-toggle"
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
        >
          ☰
        </button>
      </div>

      {/* CLIENT DASHBOARD MENU */}
      {inClientDashboard ? (
        <ul className="sidebar-menu">
          {clientMenu.map((item) => (
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
      ) : (
        /* ADMIN MENU */
        hasPermission("admin:access") && (
          <ul className="sidebar-menu">
            {adminMenu.map((item) => (
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
        )
      )}
    </aside>
  );
};

export default Sidebar;