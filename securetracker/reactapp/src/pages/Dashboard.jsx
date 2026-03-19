import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { assetService } from '../services/assetService';
import Navbar from '../components/Auth/Layout/Navbar/Navbar';
import Sidebar from '../components/Auth/Layout/Sidebar/Sidebar';
import Footer from '../components/Auth/Layout/Footer';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [assets, setAssets] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    assetService.getAllAssets().then(setAssets);
  }, []);

  const totalAssets = assets.length;
  const activeAssets = assets.filter(a => a.status === 'active').length;
  const trackedToday = assets.filter(
    a => a.last_latitude != null && a.last_longitude != null
  ).length;
  const activeAlerts = assets.filter(a => a.status === 'maintenance').length;

  return (
    <div className="dashboard-layout">
      <Navbar toggleSidebar={() => setSidebarOpen(p => !p)} />
      <Sidebar isOpen={sidebarOpen} />

      <main className="dashboard-main">
        <h1>Dashboard</h1>

        <div className="stats-grid">
          <div onClick={() => navigate('/assets')}>Total Assets: {totalAssets}</div>
          <div>Active Assets: {activeAssets}</div>
          <div onClick={() => navigate('/tracking')}>Tracked Today: {trackedToday}</div>
          <div>Active Alerts: {activeAlerts}</div>
        </div>

        <Footer />
      </main>
    </div>
  );
};

export default Dashboard;