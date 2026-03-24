import React, { useState, useEffect } from "react";
import "./AssetForm.css";

const AssetForm = ({ asset, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    asset_id: "",
    description: "",
    asset_type: "excavator",
    status: "active",
    make: "",
    model: "",
    year: "",
    license_plate: "",
    color: "",
    last_latitude: "",
    last_longitude: "",
  });

  const assetTypes = [
    "excavator",
    "backhoe_loader",
    "bulldozer",
    "wheel_loader",
    "dump_truck",
    "concrete_mixer",
    "tower_crane",
    "mobile_crane",
    "crawler_crane",
    "forklift",
    "grader",
    "roller",
    "paver",
    "compactor",
    "telehandler",
    "other",
  ];

  const statusOptions = ["active", "inactive", "maintenance", "stolen"];

  const pretty = (s) =>
    String(s || "")
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

  useEffect(() => {
    if (!asset) return;

    const lat =
      asset.last_latitude ??
      asset.lastLatitude ??
      asset.latitude ??
      asset.lat ??
      asset.location?.latitude ??
      asset.location?.lat ??
      "";

    const lon =
      asset.last_longitude ??
      asset.lastLongitude ??
      asset.longitude ??
      asset.lon ??
      asset.lng ??
      asset.location?.longitude ??
      asset.location?.lon ??
      asset.location?.lng ??
      "";

    setFormData({
      asset_id: String(asset.asset_id ?? asset.assetId ?? "").replace(/\D/g, ""),
      description: asset.description ?? "",
      asset_type: asset.asset_type ?? asset.type ?? "excavator",
      status: asset.status ?? "active",
      make: asset.make ?? "",
      model: asset.model ?? "",
      year: asset.year ?? "",
      license_plate: asset.license_plate ?? asset.licensePlate ?? "",
      color: asset.color ?? "",
      last_latitude: lat,
      last_longitude: lon,
    });
  }, [asset]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "asset_id") {
      setFormData((prev) => ({
        ...prev,
        asset_id: value.replace(/\D/g, ""),
      }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!/^\d+$/.test(formData.asset_id)) {
      alert("Asset ID must contain only numeric values");
      return;
    }

    const payload = {
      ...formData,
      year: formData.year === "" ? null : Number(formData.year),
      last_latitude:
        formData.last_latitude === "" ? null : Number(formData.last_latitude),
      last_longitude:
        formData.last_longitude === "" ? null : Number(formData.last_longitude),
    };

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="asset-form">
      {/* Asset ID */}
      <div className="form-group">
        <label>Asset ID *</label>
        <input
          type="text"
          name="asset_id"
          value={formData.asset_id}
          onChange={handleChange}
          placeholder="Enter unique asset ID (e.g., 1001)"
          required
          disabled={!!asset}
          inputMode="numeric"
          maxLength={10}
        />
      </div>

      {/* Asset Type & Status */}
      <div className="form-row">
        <div className="form-group">
          <label>Vehicle Type *</label>
          <select
            name="asset_type"
            value={formData.asset_type}
            onChange={handleChange}
            required
          >
            {assetTypes.map((t) => (
              <option key={t} value={t}>
                {pretty(t)}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Status *</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            required
          >
            {statusOptions.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Make & Model */}
      <div className="form-row">
        <div className="form-group">
          <label>Make</label>
          <input
            name="make"
            value={formData.make}
            onChange={handleChange}
            placeholder="Manufacturer (e.g., CAT, JCB)"
          />
        </div>

        <div className="form-group">
          <label>Model</label>
          <input
            name="model"
            value={formData.model}
            onChange={handleChange}
            placeholder="Model number (e.g., 320D)"
          />
        </div>
      </div>

      {/* Year & License Plate */}
      <div className="form-row">
        <div className="form-group">
          <label>Year</label>
          <input
            type="number"
            name="year"
            value={formData.year}
            onChange={handleChange}
            placeholder="Manufacturing year (e.g., 2023)"
            min="1900"
            max={new Date().getFullYear() + 1}
          />
        </div>

        <div className="form-group">
          <label>License Plate</label>
          <input
            type="text"
            name="license_plate"
            value={formData.license_plate}
            onChange={handleChange}
            placeholder="Vehicle number (e.g., TN-09-AB-1234)"
          />
        </div>
      </div>

      {/* Color */}
      <div className="form-group">
        <label>Color</label>
        <input
          name="color"
          value={formData.color}
          onChange={handleChange}
          placeholder="Asset color (e.g., Yellow)"
        />
      </div>

      {/* Location */}
      <div className="form-row">
        <div className="form-group">
          <label>Latitude</label>
          <input
            type="number"
            name="last_latitude"
            value={formData.last_latitude}
            onChange={handleChange}
            placeholder="Latitude (e.g., 13.0827)"
            step="any"
          />
        </div>

        <div className="form-group">
          <label>Longitude</label>
          <input
            type="number"
            name="last_longitude"
            value={formData.last_longitude}
            onChange={handleChange}
            placeholder="Longitude (e.g., 80.2707)"
            step="any"
          />
        </div>
      </div>

      {/* Description */}
      <div className="form-group">
        <label>Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Add any additional details about this asset"
          rows={3}
        />
      </div>

      {/* Actions */}
      <div className="form-actions">
        <button type="button" className="cancel-btn" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="submit-btn">
          {asset ? "Update Asset" : "Add Asset"}
        </button>
      </div>
    </form>
  );
};

export default AssetForm;
