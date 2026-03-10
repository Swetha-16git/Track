import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Auth/Layout/Navbar/Navbar';
import Sidebar from '../components/Auth/Layout/Sidebar/Sidebar';
import Footer from '../components/Auth/Layout/Footer';
import './Dashboard.css';

const Dashboard = () => {
  const { user, hasPermission } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Mock data for dashboard
  const stats = {
    totalAssets: 156,
    activeAssets: 142,
    trackedToday: 89,
    alerts: 5,
  };

  const recentActivity = [
    { id: 1, type: 'asset_added', message: 'New asset "Tesla Model 3" added', time: '2 mins ago' },
    { id: 2, type: 'tracking', message: 'Asset ASSET001 entered geofence zone', time: '15 mins ago' },
    { id: 3, type: 'alert', message: 'Speed alert: Asset ASSET003 exceeded limit', time: '30 mins ago' },
    { id: 4, type: 'maintenance', message: 'Asset ASSET007 scheduled for maintenance', time: '1 hour ago' },
    { id: 5, type: 'tracking', message: 'Asset ASSET002 completed route', time: '2 hours ago' },
  ];

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="dashboard-layout">
      <Navbar toggleSidebar={toggleSidebar} />
      <div className="dashboard-container">
        <Sidebar isOpen={sidebarOpen} />
        <main className="dashboard-main">
          <div className="dashboard-header">
            <h1>Welcome back, {user?.username || 'User'}!</h1>
            <p>Here's what's happening with your fleet today.</p>
          </div>

          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card" onClick={() => navigate('/assets')}>
              <div className="stat-icon">🚗</div>
              <div className="stat-info">
                <h3>{stats.totalAssets}</h3>
                <p>Total Assets</p>
              </div>
            </div>
            <div className="stat-card" onClick={() => navigate('/tracking')}>
              <div className="stat-icon">🟢</div>
              <div className="stat-info">
                <h3>{stats.activeAssets}</h3>
                <p>Active Assets</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🗺️</div>
              <div className="stat-info">
                <h3>{stats.trackedToday}</h3>
                <p>Tracked Today</p>
              </div>
            </div>
            <div className="stat-card alert-card">
              <div className="stat-icon">⚠️</div>
              <div className="stat-info">
                <h3>{stats.alerts}</h3>
                <p>Active Alerts</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          {hasPermission('manage_assets') && (
            <div className="quick-actions">
              <h2>Quick Actions</h2>
              <div className="action-buttons">
                <button className="action-btn-primary" onClick={() => navigate('/asset-onboarding')}>
                  ➕ Add New Asset
                </button>
                <button className="action-btn-secondary" onClick={() => navigate('/tracking')}>
                  🗺️ View Live Tracking
                </button>
                <button className="action-btn-secondary" onClick={() => navigate('/reports')}>
                  📊 Generate Report
                </button>
              </div>
            </div>
          )}

          {/* Recent Activity */}
          <div className="recent-activity">
            <h2>Recent Activity</h2>
            <div className="activity-list">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="activity-item">
                  <div className="activity-icon">
                    {activity.type === 'asset_added' && '➕'}
                    {activity.type === 'tracking' && '🗺️'}
                    {activity.type === 'alert' && '⚠️'}
                    {activity.type === 'maintenance' && '🔧'}
                  </div>
                  <div className="activity-details">
                    <p className="activity-message">{activity.message}</p>
                    <span className="activity-time">{activity.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Footer />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;

