import React from 'react';
import './AssetCard.css';

const AssetCard = ({ asset, onEdit, onDelete, onTrack }) => {
  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'status-active';
      case 'inactive':
        return 'status-inactive';
      case 'maintenance':
        return 'status-maintenance';
      default:
        return 'status-unknown';
    }
  };

  const getTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'car':
        return '🚗';
      case 'bike':
        return '🏍️';
      case 'truck':
        return '🚚';
      case 'bus':
        return '🚌';
      default:
        return '🚙';
    }
  };

  return (
    <div className="asset-card">
      <div className="asset-header">
        <div className="asset-icon">{getTypeIcon(asset.type)}</div>
        <div className="asset-info">
          <h3 className="asset-name">{asset.name || asset.assetId}</h3>
          <span className="asset-id">ID: {asset.assetId}</span>
        </div>
        <span className={`asset-status ${getStatusClass(asset.status)}`}>
          {asset.status || 'Unknown'}
        </span>
      </div>

      <div className="asset-body">
        <div className="asset-detail">
          <span className="detail-label">Type:</span>
          <span className="detail-value">{asset.type || 'Vehicle'}</span>
        </div>
        <div className="asset-detail">
          <span className="detail-label">Model:</span>
          <span className="detail-value">{asset.model || 'N/A'}</span>
        </div>
        <div className="asset-detail">
          <span className="detail-label">License Plate:</span>
          <span className="detail-value">{asset.licensePlate || 'N/A'}</span>
        </div>
        {asset.location && (
          <div className="asset-detail">
            <span className="detail-label">Location:</span>
            <span className="detail-value">{asset.location}</span>
          </div>
        )}
      </div>

      <div className="asset-actions">
        {onTrack && (
          <button className="action-btn track-btn" onClick={() => onTrack(asset)}>
            <span>🗺️</span> Track
          </button>
        )}
        {onEdit && (
          <button className="action-btn edit-btn" onClick={() => onEdit(asset)}>
            <span>✏️</span> Edit
          </button>
        )}
        {onDelete && (
          <button className="action-btn delete-btn" onClick={() => onDelete(asset)}>
            <span>🗑️</span> Delete
          </button>
        )}
      </div>
    </div>
  );
};

export default AssetCard;

