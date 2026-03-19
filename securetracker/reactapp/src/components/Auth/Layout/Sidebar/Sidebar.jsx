import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../../../context/AuthContext';
import './Sidebar.css';

const Sidebar = ({ isOpen }) => {
  const { hasPermission } = useAuth();

  const menu = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊', perm: 'assets:read' },
    { path: '/asset-onboarding', label: 'Asset Onboarding', icon: '➕', perm: 'assets:write' },
    { path: '/users', label: 'Users', icon: '👥', perm: 'manage_users' },
    { path: '/reports', label: 'Reports', icon: '📈', perm: 'assets:read' },
  ];

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <ul>
        {menu
          .filter(m => hasPermission(m.perm))
          .map(m => (
            <li key={m.path}>
              <NavLink to={m.path}>
                {m.icon} {m.label}
              </NavLink>
            </li>
          ))}
      </ul>
    </aside>
  );
};

export default Sidebar;