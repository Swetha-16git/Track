import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../../../context/AuthContext';
import './Sidebar.css';

const Sidebar = ({ isOpen }) => {
  const { user, hasPermission } = useAuth();

  const menuItems = [
    {
      path: '/dashboard',
      icon: '📊',
      label: 'Dashboard',
      permission: 'read',
    },
    {
      path: '/assets',
      icon: '🚗',
      label: 'Assets',
      permission: 'read',
    },
    {
      path: '/asset-onboarding',
      icon: '➕',
      label: 'Asset Onboarding',
      permission: 'manage_assets',
    },
    {
      path: '/tracking',
      icon: '🗺️',
      label: 'Live Tracking',
      permission: 'view_tracking',
    },
    {
      path: '/users',
      icon: '👥',
      label: 'Users',
      permission: 'manage_users',
    },
    {
      path: '/roles',
      icon: '🔐',
      label: 'Roles & Permissions',
      permission: 'manage_users',
    },
    {
      path: '/reports',
      icon: '📈',
      label: 'Reports',
      permission: 'read',
    },
    {
      path: '/settings',
      icon: '⚙️',
      label: 'Settings',
      permission: 'read',
    },
  ];

  const filteredMenuItems = menuItems.filter((item) =>
    hasPermission(item.permission)
  );

  return (
    <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-header">
        <div className="org-info">
          <span className="org-icon">🏢</span>
          <span className="org-name">{user?.organization || 'Organization'}</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <ul className="nav-list">
          {filteredMenuItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `nav-link ${isActive ? 'active' : ''}`
                }
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar-small">
            {user?.username?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="user-details">
            <span className="user-name">{user?.username || 'User'}</span>
            <span className="user-role">{user?.role || 'Role'}</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

