import React, { useState, useEffect } from 'react';
import './Tracking.css';

const LiveMap = ({ assets, selectedAsset, onAssetSelect }) => {
  const [mapReady, setMapReady] = useState(false);

  // Mock locations for demo purposes
  const mockLocations = {
    'ASSET001': { lat: 40.7128, lng: -74.0060, address: 'New York, NY' },
    'ASSET002': { lat: 34.0522, lng: -118.2437, address: 'Los Angeles, CA' },
    'ASSET003': { lat: 41.8781, lng: -87.6298, address: 'Chicago, IL' },
    'ASSET004': { lat: 29.7604, lng: -95.3698, address: 'Houston, TX' },
    'ASSET005': { lat: 33.4484, lng: -112.0740, address: 'Phoenix, AZ' },
  };

  useEffect(() => {
    // Simulate map initialization
    const timer = setTimeout(() => setMapReady(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const getAssetLocation = (assetId) => {
    return mockLocations[assetId] || { lat: 39.8283, lng: -98.5795, address: 'Unknown Location' };
  };

  return (
    <div className="live-map-container">
      <div className="map-header">
        <h3>Live Map</h3>
        <span className="map-status">
          {mapReady ? '🟢 Live' : 'Loading...'}
        </span>
      </div>
      
      <div className="map-view">
        {!mapReady ? (
          <div className="map-loading">
            <div className="map-spinner"></div>
            <p>Loading map...</p>
          </div>
        ) : (
          <div className="map-content">
            {/* Simplified map representation */}
            <div className="map-placeholder">
              <div className="map-grid">
                {assets?.map((asset, index) => {
                  const location = getAssetLocation(asset.assetId);
                  return (
                    <div
                      key={asset.assetId}
                      className={`map-marker ${selectedAsset?.assetId === asset.assetId ? 'selected' : ''}`}
                      style={{
                        top: `${20 + (index * 15)}%`,
                        left: `${20 + (index * 12)}%`,
                      }}
                      onClick={() => onAssetSelect(asset)}
                      title={location.address}
                    >
                      <span className="marker-icon">
                        {asset.type === 'car' ? '🚗' : asset.type === 'bike' ? '🏍️' : '🚙'}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="map-legend">
                <span>🟢 Active</span>
                <span>🔴 Inactive</span>
                <span>🟡 Maintenance</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {selectedAsset && (
        <div className="asset-info-panel">
          <h4>Selected Asset</h4>
          <div className="info-row">
            <span className="info-label">ID:</span>
            <span className="info-value">{selectedAsset.assetId}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Name:</span>
            <span className="info-value">{selectedAsset.name}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Location:</span>
            <span className="info-value">{getAssetLocation(selectedAsset.assetId).address}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Speed:</span>
            <span className="info-value">{Math.floor(Math.random() * 80) + 20} km/h</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveMap;

