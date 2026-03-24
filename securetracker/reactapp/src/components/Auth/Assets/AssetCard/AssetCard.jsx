import React from "react";
import "./AssetCard.css";

const pick = (obj, keys, fallback = "") => {
  for (const k of keys) {
    const v = obj?.[k];
    if (v !== undefined && v !== null && v !== "") return v;
  }
  return fallback;
};

const pretty = (s) =>
  String(s || "")
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

const AssetCard = ({ asset, onEdit, onDelete, onTrack }) => {
  const status = pick(asset, ["status"], "unknown");
  const vehicleType = pick(asset, ["asset_type", "type"], "other");
  const assetId = pick(asset, ["asset_id", "assetId"], "-");

  const getStatusClass = (s) => {
    switch ((s || "").toLowerCase()) {
      case "active":
        return "status-active";
      case "inactive":
        return "status-inactive";
      case "maintenance":
        return "status-maintenance";
      case "stolen":
        return "status-stolen";
      default:
        return "status-unknown";
    }
  };

  const getTypeIcon = (t) => {
    switch ((t || "").toLowerCase()) {
      case "excavator":
        return "🚜";
      case "backhoe_loader":
        return "🚜";
      case "bulldozer":
        return "🚧";
      case "wheel_loader":
        return "🚜";
      case "dump_truck":
        return "🚚";
      case "concrete_mixer":
        return "🚛";
      case "tower_crane":
        return "🏗️";
      case "mobile_crane":
        return "🏗️";
      case "crawler_crane":
        return "🏗️";
      case "forklift":
        return "🏋️";
      case "grader":
        return "🛣️";
      case "roller":
        return "🛞";
      case "paver":
        return "🧱";
      case "compactor":
        return "🧱";
      case "telehandler":
        return "🦾";
      default:
        return "🏗️";
    }
  };

  return (
    <div className="asset-card">
      <div className="asset-header">
        <div className="asset-icon">{getTypeIcon(vehicleType)}</div>

        <div className="asset-info">
          {/* ✅ Name removed; Asset ID becomes title */}
          <h3 className="asset-name">Asset {assetId}</h3>
          <span className="asset-id">ID: {assetId}</span>
        </div>

        <span className={`asset-status ${getStatusClass(status)}`}>
          {status || "Unknown"}
        </span>
      </div>

      <div className="asset-body">
        <div className="asset-detail">
          <span className="detail-label">Vehicle Type:</span>
          <span className="detail-value">{pretty(vehicleType) || "Other"}</span>
        </div>

        <div className="asset-detail">
          <span className="detail-label">Make:</span>
          <span className="detail-value">{pick(asset, ["make"], "N/A")}</span>
        </div>

        <div className="asset-detail">
          <span className="detail-label">Model:</span>
          <span className="detail-value">{pick(asset, ["model"], "N/A")}</span>
        </div>

        <div className="asset-detail">
          <span className="detail-label">Year:</span>
          <span className="detail-value">{pick(asset, ["year"], "N/A")}</span>
        </div>

        <div className="asset-detail">
          <span className="detail-label">License Plate:</span>
          <span className="detail-value">
            {pick(asset, ["license_plate", "licensePlate"], "N/A")}
          </span>
        </div>

        <div className="asset-detail">
          <span className="detail-label">VIN:</span>
          <span className="detail-value">{pick(asset, ["vin"], "N/A")}</span>
        </div>

        <div className="asset-detail">
          <span className="detail-label">Color:</span>
          <span className="detail-value">{pick(asset, ["color"], "N/A")}</span>
        </div>

        {asset?.description ? (
          <div className="asset-detail">
            <span className="detail-label">Description:</span>
            <span className="detail-value">{asset.description}</span>
          </div>
        ) : null}
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
          <button
            className="action-btn delete-btn"
            onClick={() => onDelete(asset)}
          >
            <span>🗑️</span> Delete
          </button>
        )}
      </div>
    </div>
  );
};

export default AssetCard;