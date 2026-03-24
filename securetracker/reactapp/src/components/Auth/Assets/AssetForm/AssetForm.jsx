import React, { useState, useEffect } from "react";
import "./AssetForm.css";
 
const AssetForm = ({ asset, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    asset_id: "",
    description: "",
    asset_type: "excavator", // ✅ default construction type
    status: "active",
    make: "",
    model: "",
    year: "",
    license_plate: "",
    vin: "",
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
    if (asset) {
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
        // ✅ numeric-only; strips any legacy formats
        asset_id: String(asset.asset_id ?? asset.assetId ?? "").replace(/\D/g, ""),

        description: asset.description ?? "",
        asset_type: asset.asset_type ?? asset.type ?? "excavator",
        status: asset.status ?? "active",
        make: asset.make ?? "",
        model: asset.model ?? "",
        year: asset.year ?? "",
        license_plate: asset.license_plate ?? asset.licensePlate ?? "",
        vin: asset.vin ?? "",
        color: asset.color ?? "",
        last_latitude: lat,
        last_longitude: lon,
      });
    }
  }, [asset]);

  // ✅ FIXED handleChange (this is the real solution)
  const handleChange = (e) => {
    const { name, value } = e.target;

    // ✅ numeric-only asset id
    if (name === "asset_id") {
      const onlyDigits = value.replace(/\D/g, "");
      setFormData((prev) => ({ ...prev, asset_id: onlyDigits }));
      return;
    }

    // ✅ IMPORTANT: update by field name
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
 
  const handleSubmit = (e) => {
    e.preventDefault();

    // ✅ final safety: asset_id must be digits only
    if (!/^\d+$/.test(formData.asset_id)) {
      alert("Asset ID must contain only numeric values");
      return;
    }

    const payload = {
      ...formData,

      year: formData.year === "" ? null : Number(formData.year),

      last_latitude:
        formData.last_latitude === "" || formData.last_latitude === null
          ? null
          : Number(formData.last_latitude),
 
      last_longitude:
        formData.last_longitude === "" || formData.last_longitude === null
          ? null
          : Number(formData.last_longitude),
    };

    // ✅ name is not present in payload at all
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="asset-form">
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="asset_id">Asset ID *</label>

          {/* ✅ text + inputMode keeps leading zeros & blocks e/E/+/- issues */}
          <input
            type="text"
            id="asset_id"
            name="asset_id"
            value={formData.asset_id}
            onChange={handleChange}
            placeholder="e.g., 1001"
            required
            disabled={!!asset}
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={10}
          />
        </div>
      </div>
 
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="asset_type">Vehicle Type *</label>
          <select
            id="asset_type"
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
          <label htmlFor="status">Status *</label>
          <select
            id="status"
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
 
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="make">Make</label>
          <input
            type="text"
            id="make"
            name="make"
            value={formData.make}
            onChange={handleChange}
            placeholder="e.g., CAT"
          />
        </div>
 
        <div className="form-group">
          <label htmlFor="model">Model</label>
          <input
            type="text"
            id="model"
            name="model"
            value={formData.model}
            onChange={handleChange}
            placeholder="e.g., 320D"
          />
        </div>
      </div>
 
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="year">Year</label>
          <input
            type="number"
            id="year"
            name="year"
            value={formData.year}
            onChange={handleChange}
            placeholder="e.g., 2023"
            min="1900"
            max={new Date().getFullYear() + 1}
          />
        </div>
 
        <div className="form-group">
          <label htmlFor="license_plate">License Plate</label>
          <input
            type="text"
            id="license_plate"
            name="license_plate"
            value={formData.license_plate}
            onChange={handleChange}
            placeholder="e.g., TN-09-AB-1234"
          />
        </div>
      </div>
 
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="vin">VIN</label>
          <input
            type="text"
            id="vin"
            name="vin"
            value={formData.vin}
            onChange={handleChange}
            placeholder="Vehicle Identification Number"
            maxLength={50}
          />
        </div>
 
        <div className="form-group">
          <label htmlFor="color">Color</label>
          <input
            type="text"
            id="color"
            name="color"
            value={formData.color}
            onChange={handleChange}
            placeholder="e.g., Yellow"
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="last_latitude">Latitude</label>
          <input
            type="number"
            id="last_latitude"
            name="last_latitude"
            value={formData.last_latitude}
            onChange={handleChange}
            placeholder="e.g., 13.0827"
            step="any"
          />
        </div>
 
        <div className="form-group">
          <label htmlFor="last_longitude">Longitude</label>
          <input
            type="number"
            id="last_longitude"
            name="last_longitude"
            value={formData.last_longitude}
            onChange={handleChange}
            placeholder="e.g., 80.2707"
            step="any"
          />
        </div>
      </div>
 
      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Additional details about the asset"
          rows={3}
        />
      </div>
 
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
