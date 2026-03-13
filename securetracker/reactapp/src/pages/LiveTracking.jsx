import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Auth/Layout/Navbar/Navbar';
import Sidebar from '../components/Auth/Layout/Sidebar/Sidebar';
import Footer from '../components/Auth/Layout/Footer';
import LiveMap from '../components/Auth/Tracking/LiveMap';
import TrackingTable from '../components/Auth/Tracking/TrackingTable';
import './LiveTracking.css';

const LiveTracking = () => {
  const { hasPermission } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [viewMode, setViewMode] = useState('both'); // 'map', 'table', 'both'
  const [loading] = useState(false);

  // Mock assets data
  const assets = [
    { id: 1, assetId: 'ASSET001', name: 'Toyota Camry', type: 'car', status: 'active' },
    { id: 2, assetId: 'ASSET002', name: 'Honda Civic', type: 'car', status: 'active' },
    { id: 3, assetId: 'ASSET003', name: 'Ford F-150', type: 'truck', status: 'maintenance' },
    { id: 4, assetId: 'ASSET004', name: 'Yamaha MT-07', type: 'bike', status: 'active' },
    { id: 5, assetId: 'ASSET005', name: 'Tesla Model 3', type: 'car', status: 'active' },
  ];

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleAssetSelect = (asset) => {
    setSelectedAsset(asset);
  };

  const handleViewDetails = (trackingItem) => {
    const asset = assets.find((a) => a.assetId === trackingItem.assetId);
    setSelectedAsset(asset);
  };

  // Auto-refresh tracking data
  useEffect(() => {
    const interval = setInterval(() => {
      // In real implementation, this would fetch new tracking data
      console.log('Refreshing tracking data...');
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  if (!hasPermission('view_tracking')) {
    return (
      <div className="live-tracking-layout">
        <Navbar toggleSidebar={toggleSidebar} />
        <div className="dashboard-container">
          <Sidebar isOpen={sidebarOpen} />
          <main className="dashboard-main">
            <div className="access-denied">
              <h2>Access Denied</h2>
              <p>You don't have permission to view tracking.</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="live-tracking-layout">
      <Navbar toggleSidebar={toggleSidebar} />
      <div className="dashboard-container">
        <Sidebar isOpen={sidebarOpen} />
        <main className="dashboard-main">
          <div className="page-header">
            <div>
              <h1>Live Tracking</h1>
              <p>Real-time vehicle tracking and monitoring</p>
            </div>
            <div className="view-toggle">
              <button
                className={`view-btn ${viewMode === 'map' ? 'active' : ''}`}
                onClick={() => setViewMode('map')}
              >
                🗺️ Map
              </button>
              <button
                className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
                onClick={() => setViewMode('table')}
              >
                📋 Table
              </button>
              <button
                className={`view-btn ${viewMode === 'both' ? 'active' : ''}`}
                onClick={() => setViewMode('both')}
              >
                🔄 Both
              </button>
            </div>
          </div>

          <div className={`tracking-content ${viewMode}`}>
            {(viewMode === 'map' || viewMode === 'both') && (
              <div className="map-section">
                <LiveMap
                  assets={assets}
                  selectedAsset={selectedAsset}
                  onAssetSelect={handleAssetSelect}
                />
              </div>
            )}

            {(viewMode === 'table' || viewMode === 'both') && (
              <div className="table-section">
                <TrackingTable
                  trackingData={null}
                  loading={loading}
                  onViewDetails={handleViewDetails}
                />
              </div>
            )}
          </div>

          <Footer />
        </main>
      </div>
    </div>
  );
};

export default LiveTracking;

