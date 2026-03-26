import React, { useState, useEffect } from "react";
import "./AssetTypeForm.css";

const AssetTypeForm = ({ assetType, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    Asset_Type: "",
    Asset_Code: "",
    ShortCode: "",
    Criticality: "",
    Is_Critical_Flag: "",
    SortingOrderId: "",
    EquipmentCategory_Key: "",
    DashboardURL: "",
    IconCssName: "",

    Exp_Working_Hrs: "",
    Exp_Idle_Hrs: "",
    Exp_OFF_Hrs: "",
    Exp_Runtime_Hrs: "",

    Exp_IdleFuelBurnRate: "",
    Exp_WorkingFuelBurnRate: "",
    Exp_RuntimeFuelBurnRate: "",

    Engine_Oil_Pressure_LTL: "",
    Engine_Oil_Pressure_UTL: "",

    KW_Hours_Benchmark: "",
    Average_RPM: "",

    Transmission_Temperature_LTL: "",
    Transmission_Temperature_UTL: "",
  });

  const criticalOptions = ["High", "Medium", "Low", "None"];

  useEffect(() => {
    if (!assetType) return;

    setFormData({
      Asset_Type: assetType.Asset_Type || "",
      Asset_Code: assetType.Asset_Code || "",
      ShortCode: assetType.ShortCode || "",
      Criticality: assetType.Criticality || "",
      Is_Critical_Flag: assetType.Is_Critical_Flag ?? "",
      SortingOrderId: assetType.SortingOrderId ?? "",
      EquipmentCategory_Key: assetType.EquipmentCategory_Key ?? "",
      DashboardURL: assetType.DashboardURL || "",
      IconCssName: assetType.IconCssName || "",

      Exp_Working_Hrs: assetType.Exp_Working_Hrs ?? "",
      Exp_Idle_Hrs: assetType.Exp_Idle_Hrs ?? "",
      Exp_OFF_Hrs: assetType.Exp_OFF_Hrs ?? "",
      Exp_Runtime_Hrs: assetType.Exp_Runtime_Hrs ?? "",

      Exp_IdleFuelBurnRate: assetType.Exp_IdleFuelBurnRate ?? "",
      Exp_WorkingFuelBurnRate: assetType.Exp_WorkingFuelBurnRate ?? "",
      Exp_RuntimeFuelBurnRate: assetType.Exp_RuntimeFuelBurnRate ?? "",

      Engine_Oil_Pressure_LTL: assetType.Engine_Oil_Pressure_LTL ?? "",
      Engine_Oil_Pressure_UTL: assetType.Engine_Oil_Pressure_UTL ?? "",

      KW_Hours_Benchmark: assetType.KW_Hours_Benchmark ?? "",
      Average_RPM: assetType.Average_RPM ?? "",

      Transmission_Temperature_LTL: assetType.Transmission_Temperature_LTL ?? "",
      Transmission_Temperature_UTL: assetType.Transmission_Temperature_UTL ?? "",
    });
  }, [assetType]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.Asset_Type.trim() || !formData.Asset_Code.trim()) {
      alert("Asset Type and Asset Code are required");
      return;
    }

    const payload = { ...formData };

    Object.keys(payload).forEach((key) => {
      const v = payload[key];

      if (v === "") {
        if (
          key.includes("Exp_") ||
          key.includes("Engine_") ||
          key.includes("KW_") ||
          key.includes("Average_") ||
          key.includes("Transmission_") ||
          ["Is_Critical_Flag", "SortingOrderId", "EquipmentCategory_Key"].includes(key)
        ) {
          payload[key] = null;
        }
        return;
      }

      if (["Is_Critical_Flag", "SortingOrderId", "EquipmentCategory_Key"].includes(key)) {
        payload[key] = Number.isNaN(parseInt(v, 10)) ? null : parseInt(v, 10);
        return;
      }

      if (
        key.includes("Exp_") ||
        key.includes("Engine_") ||
        key.includes("KW_") ||
        key.includes("Average_") ||
        key.includes("Transmission_")
      ) {
        payload[key] = Number.isNaN(parseFloat(v)) ? null : parseFloat(v);
      }
    });

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="asset-type-form">
      {/* OEM-style header */}
      <div className="cfg-header">
        <h2>Asset Type Configuration</h2>
        <span className="cfg-required">* Required Fields</span>
      </div>

      {/* Row 1 */}
      <div className="cfg-row">
        <div className="cfg-field">
          <label>Asset Type *</label>
          <input
            name="Asset_Type"
            value={formData.Asset_Type}
            onChange={handleChange}
            placeholder="Asset Type"
          />
        </div>

        <div className="cfg-field">
          <label>Asset Code *</label>
          <input
            name="Asset_Code"
            value={formData.Asset_Code}
            onChange={handleChange}
            placeholder="Asset Code"
          />
        </div>
      </div>

      {/* Row 2 */}
      <div className="cfg-row">
        <div className="cfg-field">
          <label>Short Code</label>
          <input
            name="ShortCode"
            value={formData.ShortCode}
            onChange={handleChange}
            placeholder="Short Code"
          />
        </div>

        <div className="cfg-field">
          <label>Equipment Category Key</label>
          <input
            type="number"
            name="EquipmentCategory_Key"
            value={formData.EquipmentCategory_Key}
            onChange={handleChange}
            placeholder="Equipment Category Key"
          />
        </div>
      </div>

      {/* Row 3 */}
      <div className="cfg-row">
        <div className="cfg-field">
          <label>Criticality</label>
          <select name="Criticality" value={formData.Criticality} onChange={handleChange}>
            <option value="">Select</option>
            {criticalOptions.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </div>

        <div className="cfg-field">
          <label>Is Critical Flag (0/1)</label>
          <input
            type="number"
            name="Is_Critical_Flag"
            value={formData.Is_Critical_Flag}
            onChange={handleChange}
            placeholder="0 or 1"
          />
        </div>
      </div>

      {/* Expected Hours -> 2 rows (still OEM 2-col layout) */}
      <div className="cfg-row">
        <div className="cfg-field">
          <label>Expected Working Hours</label>
          <input
            type="number"
            step="0.1"
            name="Exp_Working_Hrs"
            value={formData.Exp_Working_Hrs}
            onChange={handleChange}
            placeholder="Working"
          />
        </div>

        <div className="cfg-field">
          <label>Expected Idle Hours</label>
          <input
            type="number"
            step="0.1"
            name="Exp_Idle_Hrs"
            value={formData.Exp_Idle_Hrs}
            onChange={handleChange}
            placeholder="Idle"
          />
        </div>
      </div>

      <div className="cfg-row">
        <div className="cfg-field">
          <label>Expected OFF Hours</label>
          <input
            type="number"
            step="0.1"
            name="Exp_OFF_Hrs"
            value={formData.Exp_OFF_Hrs}
            onChange={handleChange}
            placeholder="OFF"
          />
        </div>

        <div className="cfg-field">
          <label>Expected Runtime Hours</label>
          <input
            type="number"
            step="0.1"
            name="Exp_Runtime_Hrs"
            value={formData.Exp_Runtime_Hrs}
            onChange={handleChange}
            placeholder="Runtime"
          />
        </div>
      </div>

      {/* Fuel burn */}
      <div className="cfg-row">
        <div className="cfg-field">
          <label>Idle Fuel Burn Rate</label>
          <input
            type="number"
            step="0.01"
            name="Exp_IdleFuelBurnRate"
            value={formData.Exp_IdleFuelBurnRate}
            onChange={handleChange}
            placeholder="Idle"
          />
        </div>

        <div className="cfg-field">
          <label>Working Fuel Burn Rate</label>
          <input
            type="number"
            step="0.01"
            name="Exp_WorkingFuelBurnRate"
            value={formData.Exp_WorkingFuelBurnRate}
            onChange={handleChange}
            placeholder="Working"
          />
        </div>
      </div>

      <div className="cfg-row">
        <div className="cfg-field">
          <label>Runtime Fuel Burn Rate</label>
          <input
            type="number"
            step="0.01"
            name="Exp_RuntimeFuelBurnRate"
            value={formData.Exp_RuntimeFuelBurnRate}
            onChange={handleChange}
            placeholder="Runtime"
          />
        </div>

        <div className="cfg-field">
          <label>Sorting Order ID</label>
          <input
            type="number"
            name="SortingOrderId"
            value={formData.SortingOrderId}
            onChange={handleChange}
            placeholder="Sorting Order"
          />
        </div>
      </div>

      {/* Engine */}
      <div className="cfg-row">
        <div className="cfg-field">
          <label>Engine Oil Pressure LTL</label>
          <input
            type="number"
            step="0.1"
            name="Engine_Oil_Pressure_LTL"
            value={formData.Engine_Oil_Pressure_LTL}
            onChange={handleChange}
            placeholder="LTL"
          />
        </div>

        <div className="cfg-field">
          <label>Engine Oil Pressure UTL</label>
          <input
            type="number"
            step="0.1"
            name="Engine_Oil_Pressure_UTL"
            value={formData.Engine_Oil_Pressure_UTL}
            onChange={handleChange}
            placeholder="UTL"
          />
        </div>
      </div>

      {/* Transmission */}
      <div className="cfg-row">
        <div className="cfg-field">
          <label>Transmission Temp LTL</label>
          <input
            type="number"
            step="0.1"
            name="Transmission_Temperature_LTL"
            value={formData.Transmission_Temperature_LTL}
            onChange={handleChange}
            placeholder="LTL"
          />
        </div>

        <div className="cfg-field">
          <label>Transmission Temp UTL</label>
          <input
            type="number"
            step="0.1"
            name="Transmission_Temperature_UTL"
            value={formData.Transmission_Temperature_UTL}
            onChange={handleChange}
            placeholder="UTL"
          />
        </div>
      </div>

      {/* Benchmarks */}
      <div className="cfg-row">
        <div className="cfg-field">
          <label>KW Hours Benchmark</label>
          <input
            type="number"
            step="0.1"
            name="KW_Hours_Benchmark"
            value={formData.KW_Hours_Benchmark}
            onChange={handleChange}
            placeholder="KW Hours"
          />
        </div>

        <div className="cfg-field">
          <label>Average RPM</label>
          <input
            type="number"
            step="1"
            name="Average_RPM"
            value={formData.Average_RPM}
            onChange={handleChange}
            placeholder="RPM"
          />
        </div>
      </div>

      {/* URLs / Other */}
      <div className="cfg-row">
        <div className="cfg-field">
          <label>Dashboard URL</label>
          <input
            type="url"
            name="DashboardURL"
            value={formData.DashboardURL}
            onChange={handleChange}
            placeholder="https://dashboard-url"
          />
        </div>

        <div className="cfg-field">
          <label>Icon CSS Name</label>
          <input
            name="IconCssName"
            value={formData.IconCssName}
            onChange={handleChange}
            placeholder="Icon CSS Name"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="cfg-actions">
        <button type="submit" className="cfg-save">
          {assetType ? "Update" : "Save"}
        </button>
        <button type="button" className="cfg-cancel" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
};

export default AssetTypeForm;