import React, { useState, useEffect } from 'react';
import './AssetForm.css';

const AssetForm = ({ asset, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'car',
    model: '',
    year: '',
    licensePlate: '',
    vin: '',
    color: '',
    status: 'active',
    description: '',
  });

  useEffect(() => {
    if (asset) {
      setFormData(asset);
    }
  }, [asset]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const assetTypes = ['car', 'bike', 'truck', 'bus', 'van', 'other'];
  const statusOptions = ['active', 'inactive', 'maintenance'];

  return (
    <form onSubmit={handleSubmit} className="asset-form">
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="name">Asset Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter asset name"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="type">Asset Type *</label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            required
          >
            {assetTypes.map((type) => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="model">Model</label>
          <input
            type="text"
            id="model"
            name="model"
            value={formData.model}
            onChange={handleChange}
            placeholder="e.g., Toyota Camry"
          />
        </div>

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
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="licensePlate">License Plate *</label>
          <input
            type="text"
            id="licensePlate"
            name="licensePlate"
            value={formData.licensePlate}
            onChange={handleChange}
            placeholder="e.g., ABC-1234"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="vin">VIN</label>
          <input
            type="text"
            id="vin"
            name="vin"
            value={formData.vin}
            onChange={handleChange}
            placeholder="Vehicle Identification Number"
            maxLength={17}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="color">Color</label>
          <input
            type="text"
            id="color"
            name="color"
            value={formData.color}
            onChange={handleChange}
            placeholder="e.g., Silver"
          />
        </div>

        <div className="form-group">
          <label htmlFor="status">Status</label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
          >
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
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
          {asset ? 'Update Asset' : 'Add Asset'}
        </button>
      </div>
    </form>
  );
};

export default AssetForm;

