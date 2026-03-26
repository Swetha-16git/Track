import React, { useState, useEffect } from "react";
import "./OEMForm.css";

const OEMForm = ({ oem, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    OEM_Provider: "",
    OEM_ProviderName: "",
    OEM_Description: "",
    History_TableName: "",
    Is_Solution: "",
    Is_ForLiveTracking: "",
    AssetIdColumnName: "",
    CCodeColumnName: "",
    InstanceTimeColumnName: "",
    InstanceDateColumnName: "",
    Productivity_TableName: "",
    WorkDoneUOM: "",
    APPLICATION_NAME: "",
    AssetSubCategory: "",
  });

  useEffect(() => {
    if (oem) setFormData(oem);
  }, [oem]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.OEM_Provider) {
      alert("OEM Provider is required");
      return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="oem-form oem-config">
      {/* Header like your screenshot */}
      <div className="oem-config__header">
        <div className="oem-config__title">OEM Onboarding Configuration</div>
        <div className="oem-config__meta">
          <span className="oem-config__req">* Required Fields</span>
          <button type="button" className="oem-config__close" onClick={onCancel} aria-label="Close">
            ×
          </button>
        </div>
      </div>

      {/* Row 1 */}
      <div className="form-row">
        <div className="form-group">
          <label>OEM Provider *</label>
          <input
            name="OEM_Provider"
            value={formData.OEM_Provider}
            onChange={handleChange}
            placeholder="OEM Key"
            required
          />
        </div>

        <div className="form-group">
          <label>OEM Provider Name</label>
          <input
            name="OEM_ProviderName"
            value={formData.OEM_ProviderName}
            onChange={handleChange}
            placeholder="OEM Provider"
          />
        </div>
      </div>

      {/* Row 2 */}
      <div className="form-row">
        <div className="form-group">
          <label>History Table Name</label>
          <input
            name="History_TableName"
            value={formData.History_TableName}
            onChange={handleChange}
            placeholder="History Table Name"
          />
        </div>

        <div className="form-group">
          <label>Productivity Table Name</label>
          <input
            name="Productivity_TableName"
            value={formData.Productivity_TableName}
            onChange={handleChange}
            placeholder="Productivity Table Name"
          />
        </div>
      </div>

      {/* Row 3 */}
      <div className="form-row">
        <div className="form-group">
          <label>Is Solution</label>
          <select name="Is_Solution" value={formData.Is_Solution} onChange={handleChange}>
            <option value="">Select</option>
            <option value="Y">Yes</option>
            <option value="N">No</option>
          </select>
        </div>

        <div className="form-group">
          <label>Is For Live Tracking</label>
          <select
            name="Is_ForLiveTracking"
            value={formData.Is_ForLiveTracking}
            onChange={handleChange}
          >
            <option value="">Select</option>
            <option value="Y">Yes</option>
            <option value="N">No</option>
          </select>
        </div>
      </div>

      {/* Row 4 */}
      <div className="form-row">
        <div className="form-group">
          <label>Asset ID Column Name</label>
          <input
            name="AssetIdColumnName"
            value={formData.AssetIdColumnName}
            onChange={handleChange}
            placeholder="Asset ID Column Name"
          />
        </div>

        <div className="form-group">
          <label>C Code Column Name</label>
          <input
            name="CCodeColumnName"
            value={formData.CCodeColumnName}
            onChange={handleChange}
            placeholder="C Code Column Name"
          />
        </div>
      </div>

      {/* Row 5 */}
      <div className="form-row">
        <div className="form-group">
          <label>Instance Time Column Name</label>
          <input
            name="InstanceTimeColumnName"
            value={formData.InstanceTimeColumnName}
            onChange={handleChange}
            placeholder="Instance Time Column Name"
          />
        </div>

        <div className="form-group">
          <label>Instance Date Column Name</label>
          <input
            name="InstanceDateColumnName"
            value={formData.InstanceDateColumnName}
            onChange={handleChange}
            placeholder="Instance Date Column Name"
          />
        </div>
      </div>

      {/* Row 6 */}
      <div className="form-row">
        <div className="form-group">
          <label>Work Done UOM</label>
          <input
            name="WorkDoneUOM"
            value={formData.WorkDoneUOM}
            onChange={handleChange}
            placeholder="Work Done UOM"
          />
        </div>

        <div className="form-group">
          <label>Application Name</label>
          <input
            name="APPLICATION_NAME"
            value={formData.APPLICATION_NAME}
            onChange={handleChange}
            placeholder="Application Name"
          />
        </div>
      </div>

      {/* Full width fields like screenshot */}
      <div className="form-row">
        <div className="form-group full">
          <label>OEM Description</label>
          <input
            name="OEM_Description"
            value={formData.OEM_Description}
            onChange={handleChange}
            placeholder="OEM Description"
            maxLength={255}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group full">
          <label>Asset Sub Category</label>
          <input
            name="AssetSubCategory"
            value={formData.AssetSubCategory}
            onChange={handleChange}
            placeholder="Asset Sub Category"
          />
        </div>
      </div>

      {/* Actions (centered like config screens) */}
      <div className="form-actions oem-config__actions">
        <button type="button" className="cancel-btn" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="submit-btn">
          {oem ? "Update" : "Save"}
        </button>
      </div>
    </form>
  );
};

export default OEMForm;