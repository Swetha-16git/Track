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

// Dynamic asset types to be fetched from /asset-types

  const statusOptions = ["active", "inactive", "maintenance", "stolen"];

// pretty removed




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
    <form onSubmit={handleSubmit} className="oem-form">

  {/* Header */}
  <div className="oem-header">
    <h2>Asset Onboarding Configuration</h2>
    <span className="required-note">* Required Fields</span>
  </div>

  {/* ROW 1 */}
  <div className="oem-row">
    <div className="oem-field">
      <label>Asset ID *</label>
      <input
        name="asset_id"
        value={formData.asset_id}
        onChange={handleChange}
        disabled={!!asset}
        required
      />
    </div>

    <div className="oem-field">
      <label>Asset Type *</label>
      <select
        name="asset_type"
        value={formData.asset_type}
        onChange={handleChange}
        required
      >
        <option value="excavator">Excavator</option>
        <option value="other">Other</option>
      </select>
    </div>
  </div>

  {/* ROW 2 */}
  <div className="oem-row">
    <div className="oem-field">
      <label>Status *</label>
      <select
        name="status"
        value={formData.status}
        onChange={handleChange}
        required
      >
        {statusOptions.map(s => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
    </div>

    <div className="oem-field">
      <label>Make</label>
      <input name="make" value={formData.make} onChange={handleChange} />
    </div>
  </div>

  {/* ROW 3 */}
  <div className="oem-row">
    <div className="oem-field">
      <label>Model</label>
      <input name="model" value={formData.model} onChange={handleChange} />
    </div>

    <div className="oem-field">
      <label>Year</label>
      <input
        type="number"
        name="year"
        value={formData.year}
        onChange={handleChange}
      />
    </div>
  </div>

  {/* ROW 4 */}
  <div className="oem-row">
    <div className="oem-field">
      <label>License Plate</label>
      <input
        name="license_plate"
        value={formData.license_plate}
        onChange={handleChange}
      />
    </div>

    <div className="oem-field">
      <label>Color</label>
      <input name="color" value={formData.color} onChange={handleChange} />
    </div>
  </div>

  {/* ROW 5 */}
  <div className="oem-row">
    <div className="oem-field">
      <label>Latitude</label>
      <input
        type="number"
        step="any"
        name="last_latitude"
        value={formData.last_latitude}
        onChange={handleChange}
      />
    </div>

    <div className="oem-field">
      <label>Longitude</label>
      <input
        type="number"
        step="any"
        name="last_longitude"
        value={formData.last_longitude}
        onChange={handleChange}
      />
    </div>
  </div>

  {/* ROW 6 */}
  <div className="oem-row">
    <div className="oem-field full">
      <label>Description</label>
      <input
        name="description"
        value={formData.description}
        onChange={handleChange}
      />
    </div>
  </div>

  {/* Actions */}
  <div className="oem-actions">
    <button type="submit" className="save-btn">
      {asset ? "Update" : "Save"}
    </button>
    <button type="button" onClick={onCancel} className="cancel-btn">
      Cancel
    </button>
  </div>

</form>
  );
};

export default AssetForm;
