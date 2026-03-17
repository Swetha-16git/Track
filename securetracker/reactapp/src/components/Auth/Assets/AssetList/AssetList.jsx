import React, { useState } from "react";
import AssetCard from "../AssetCard/AssetCard";
import Loader from "../../Common/Loader";
import "./AssetList.css";

const pick = (obj, keys, fallback = "") => {
  for (const k of keys) {
    const v = obj?.[k];
    if (v !== undefined && v !== null && v !== "") return v;
  }
  return fallback;
};

const AssetList = ({ assets, loading, onEdit, onDelete, onTrack }) => {
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const term = searchTerm.trim().toLowerCase();

  const filteredAssets = assets?.filter((asset) => {
    const status = (pick(asset, ["status"], "") || "").toLowerCase();

    const matchesFilter = filter === "all" || status === filter;

    const haystack = [
      pick(asset, ["name"], ""),
      pick(asset, ["asset_id", "assetId"], ""),
      pick(asset, ["license_plate", "licensePlate"], ""),
      pick(asset, ["make"], ""),
      pick(asset, ["model"], ""),
      pick(asset, ["vin"], ""),
      pick(asset, ["color"], ""),
      pick(asset, ["asset_type", "type"], ""),
    ]
      .join(" ")
      .toLowerCase();

    const matchesSearch = !term || haystack.includes(term);

    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="asset-list-loading">
        <Loader text="Loading assets..." />
      </div>
    );
  }

  return (
    <div className="asset-list-container">
      <div className="asset-list-header">
        <div className="search-filter">
          <input
            type="text"
            placeholder="Search assets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-buttons">
          <button
            className={`filter-btn ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            All
          </button>
          <button
            className={`filter-btn ${filter === "active" ? "active" : ""}`}
            onClick={() => setFilter("active")}
          >
            Active
          </button>
          <button
            className={`filter-btn ${filter === "inactive" ? "active" : ""}`}
            onClick={() => setFilter("inactive")}
          >
            Inactive
          </button>
          <button
            className={`filter-btn ${filter === "maintenance" ? "active" : ""}`}
            onClick={() => setFilter("maintenance")}
          >
            Maintenance
          </button>
          <button
            className={`filter-btn ${filter === "stolen" ? "active" : ""}`}
            onClick={() => setFilter("stolen")}
          >
            Stolen
          </button>
        </div>
      </div>

      {filteredAssets?.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">🚗</span>
          <h3>No assets found</h3>
          <p>Try adjusting your search or filter criteria</p>
        </div>
      ) : (
        <div className="asset-grid">
          {filteredAssets?.map((asset) => (
            <AssetCard
              key={asset.id || asset.asset_id || asset.assetId}
              asset={asset}
              onEdit={onEdit}
              onDelete={onDelete}
              onTrack={onTrack}
            />
          ))}
        </div>
      )}

      <div className="asset-count">
        Showing {filteredAssets?.length || 0} of {assets?.length || 0} assets
      </div>
    </div>
  );
};

export default AssetList;