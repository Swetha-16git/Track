import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import Navbar from '../components/Auth/Layout/Navbar/Navbar';
import Sidebar from '../components/Auth/Layout/Sidebar/Sidebar';
import Footer from '../components/Auth/Layout/Footer';

import LiveMap from '../components/Auth/Tracking/LiveMap';
import TrackingTable from '../components/Auth/Tracking/TrackingTable';
import { assetService } from '../services/assetService';

import './LiveTracking.css';

const LiveTracking = () => {
  const [searchParams] = useSearchParams();
  const assetFromUrl = searchParams.get('asset'); // /tracking?asset=AST-0001

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [assets, setAssets] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState(null);

  const toggleSidebar = () => setSidebarOpen((p) => !p);

  // Load assets from backend
  const loadAssets = async () => {
    try {
      const data = await assetService.getAllAssets();
      setAssets(data);
    } catch (e) {
      console.error('Error loading assets for tracking:', e);
    }
  };

  // Initial load
  useEffect(() => {
    loadAssets();
  }, []);

  // Poll every 30 seconds
  useEffect(() => {
    const t = setInterval(loadAssets, 30000);
    return () => clearInterval(t);
  }, []);

  // ✅ Select the asset from URL param whenever assets refresh
  useEffect(() => {
    if (!assetFromUrl || assets.length === 0) return;

    const found = assets.find((a) => a.asset_id === assetFromUrl);
    if (found) setSelectedAsset(found);
  }, [assetFromUrl, assets]);

  // Table data (always show all assets)
  const trackingRows = useMemo(() => {
    return assets.map((a) => ({
      assetId: a.asset_id,
      name: a.name,
      latitude: a.last_latitude,
      longitude: a.last_longitude,
      status: a.status,
      type: a.asset_type,
    }));
  }, [assets]);

  return (
    <div className="live-tracking-layout">
      <Navbar toggleSidebar={toggleSidebar} />

      <div className="dashboard-container">
        <Sidebar isOpen={sidebarOpen} />

        <main className="dashboard-main">
          <div className="page-header">
            <div>
              <h1>Live Tracking</h1>
              <p>Tracks selected asset location from URL and updates every 30 seconds</p>
            </div>
          </div>

          <div className="tracking-content both">
            <div className="map-section">
              <LiveMap
                assets={assets}
                selectedAsset={selectedAsset}
                onAssetSelect={setSelectedAsset}
              />
            </div>

            <div className="table-section">
              <TrackingTable
                trackingData={trackingRows}
                onViewDetails={(row) => {
                  const found = assets.find((a) => a.asset_id === row.assetId);
                  if (found) setSelectedAsset(found);
                }}
              />
            </div>
          </div>

          <Footer />
        </main>
      </div>
    </div>
  );
};

export default LiveTracking;