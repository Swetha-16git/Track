import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import Navbar from '../components/Auth/Layout/Navbar/Navbar';
import Sidebar from '../components/Auth/Layout/Sidebar/Sidebar';
import Footer from '../components/Auth/Layout/Footer';

import AssetList from '../components/Auth/Assets/AssetList/AssetList';
import AssetForm from '../components/Auth/Assets/AssetForm/AssetForm';
import Modal from '../components/Auth/Common/Modal';

import { assetService } from '../services/assetService';
import './AssetOnboarding.css';

/* ===============================
   Helpers
================================ */

// API → UI
const toUiAsset = (a) => ({
  id: a.id,
  assetId: a.asset_id,
  name: a.name,
  description: a.description ?? '',
  type: a.asset_type,
  status: a.status,
  make: a.make ?? '',
  model: a.model ?? '',
  year: a.year ?? '',
  licensePlate: a.license_plate ?? '',
  vin: a.vin ?? '',
  color: a.color ?? '',
  lastLatitude: a.last_latitude ?? null,
  lastLongitude: a.last_longitude ?? null,
});

// ✅ Normalize enums for Postgres ENUM
const normalizeEnum = (v, fallback) =>
  v ? String(v).trim().toLowerCase().replace(/[\s-]+/g, '_') : fallback;

// ✅ Get organisation_id from logged-in user
const getOrganisationId = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    return user?.organisation_id;
  } catch {
    return null;
  }
};

// ✅ Generate asset_id (backend requires NOT NULL)
const generateAssetId = () => `AST-${Date.now()}`;

// UI → API payload
const toApiPayload = (ui) => {
  const organisationId = getOrganisationId();

  return {
    // ✅ REQUIRED
    asset_id: ui.assetId || generateAssetId(),

    // ✅ REQUIRED
    organisation_id: organisationId,

    name: ui.name,
    description: ui.description ?? null,

    // ✅ ENUMS (must be lowercase)
    asset_type: normalizeEnum(ui.type, 'car'),
    status: normalizeEnum(ui.status, 'active'),

    make: ui.make ?? null,
    model: ui.model ?? null,
    year: ui.year ? Number(ui.year) : null,
    license_plate: ui.licensePlate ?? null,
    vin: ui.vin ?? null,
    color: ui.color ?? null,
  };
};

const AssetOnboarding = () => {
  const { hasPermission } = useAuth();

  const canRead = hasPermission('assets:read');
  const canManage = hasPermission('assets:write');

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedType = searchParams.get('type');

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);

  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageError, setPageError] = useState('');

  const toggleSidebar = () => setSidebarOpen((p) => !p);

  /* ===============================
     Load assets
  ================================ */
  useEffect(() => {
    const loadAssets = async () => {
      try {
        setPageError('');
        setLoading(true);
        const apiAssets = await assetService.getAllAssets();
        setAssets(apiAssets.map(toUiAsset));
      } catch (e) {
        console.error(e);
        setPageError('Failed to load assets.');
      } finally {
        setLoading(false);
      }
    };

    if (canRead) loadAssets();
  }, [canRead]);

  const filteredAssets = useMemo(() => {
    if (!selectedType) return assets;
    return assets.filter((a) => a.type === selectedType);
  }, [assets, selectedType]);

  /* ===============================
     Actions
  ================================ */
  const handleAddAsset = () => {
    if (!canManage) return;
    setEditingAsset(null);
    setShowModal(true);
  };

  const handleEditAsset = (asset) => {
    if (!canManage) return;
    setEditingAsset(asset);
    setShowModal(true);
  };

  const handleDeleteAsset = async (asset) => {
    if (!canManage) return;
    if (!window.confirm(`Delete "${asset.name}"?`)) return;

    try {
      setLoading(true);
      await assetService.deleteAsset(asset.id);
      setAssets((prev) => prev.filter((a) => a.id !== asset.id));
    } catch (e) {
      console.error(e);
      setPageError('Delete failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleTrackAsset = (asset) => {
    navigate(`/tracking?asset=${asset.assetId}`);
  };

  /* ===============================
     SUBMIT (FIXED)
  ================================ */
  const handleSubmitAsset = async (assetDataFromForm) => {
    if (!canManage) return;

    try {
      setPageError('');
      setLoading(true);

      const payload = toApiPayload(assetDataFromForm);
      console.log('✅ CREATE ASSET PAYLOAD:', payload);

      if (editingAsset) {
        const updated = await assetService.updateAsset(editingAsset.id, payload);
        setAssets((prev) =>
          prev.map((a) => (a.id === editingAsset.id ? toUiAsset(updated) : a))
        );
      } else {
        const created = await assetService.createAsset(payload);
        setAssets((prev) => [toUiAsset(created), ...prev]);
      }

      setShowModal(false);
      setEditingAsset(null);
    } catch (e) {
      console.error(e);

      const msg =
        e?.response?.data?.detail ||
        e?.response?.data?.message ||
        JSON.stringify(e?.response?.data) ||
        e.message;

      setPageError(`Save failed: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  if (!canRead) {
    return <div>Access Denied</div>;
  }

  return (
    <div className="asset-onboarding-layout">
      <Navbar toggleSidebar={toggleSidebar} />
      <div className="dashboard-container">
        <Sidebar isOpen={sidebarOpen} />
        <main className="dashboard-main">
          <div className="page-header">
            <h1>Assets</h1>
            {canManage && (
              <button className="add-asset-btn" onClick={handleAddAsset}>
                ➕ Add New Asset
              </button>
            )}
          </div>

          {pageError && <div className="error-message">{pageError}</div>}

          <AssetList
            assets={filteredAssets}
            loading={loading}
            onEdit={canManage ? handleEditAsset : undefined}
            onDelete={canManage ? handleDeleteAsset : undefined}
            onTrack={handleTrackAsset}
            canManage={canManage}
          />

          <Footer />
        </main>
      </div>

      {canManage && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={editingAsset ? 'Edit Asset' : 'Add New Asset'}
        >
          <AssetForm
            asset={editingAsset}
            onSubmit={handleSubmitAsset}
            onCancel={() => setShowModal(false)}
          />
        </Modal>
      )}
    </div>
  );
};

export default AssetOnboarding;