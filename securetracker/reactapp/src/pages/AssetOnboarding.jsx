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

/* API → UI */
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

/* UI → API */
const toApiPayload = (ui) => ({
  name: ui.name,
  description: ui.description ?? null,
  asset_type: ui.type || ui.asset_type || 'car',
  status: ui.status || 'active',
  make: ui.make ?? null,
  model: ui.model ?? null,
  year: ui.year ? Number(ui.year) : null,
  license_plate: ui.licensePlate ?? ui.license_plate ?? null,
  vin: ui.vin ?? null,
  color: ui.color ?? null,
  last_latitude: ui.last_latitude ?? ui.lastLatitude ?? null,
  last_longitude: ui.last_longitude ?? ui.lastLongitude ?? null,
});

const AssetOnboarding = () => {
  const { hasPermission } = useAuth();

  const canRead = hasPermission('assets:read');
  const canManage = hasPermission('assets:write');

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // ✅ NEW: support status filter
  const selectedStatus = searchParams.get('status');
  // ✅ Backward compatible: support older type filter links
  const selectedType = searchParams.get('type');

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);

  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageError, setPageError] = useState('');

  const toggleSidebar = () => setSidebarOpen((p) => !p);

  useEffect(() => {
    const loadAssets = async () => {
      try {
        setPageError('');
        setLoading(true);
        const apiAssets = await assetService.getAllAssets();
        setAssets(apiAssets.map(toUiAsset));
      } catch (e) {
        console.error(e);
        setPageError('Failed to load assets. Check backend, token, or permissions.');
      } finally {
        setLoading(false);
      }
    };

    if (canRead) loadAssets();
  }, [canRead]);

  // ✅ Filter by STATUS first, else by TYPE
  const filteredAssets = useMemo(() => {
    let list = assets;

    if (selectedStatus) {
      list = list.filter((a) => String(a.status).toLowerCase() === String(selectedStatus).toLowerCase());
    } else if (selectedType) {
      list = list.filter((a) => String(a.type).toLowerCase() === String(selectedType).toLowerCase());
    }

    return list;
  }, [assets, selectedStatus, selectedType]);

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
    if (!window.confirm(`Delete asset "${asset.name}"?`)) return;

    try {
      setLoading(true);
      await assetService.deleteAsset(asset.id);
      setAssets((prev) => prev.filter((a) => a.id !== asset.id));
    } catch (e) {
      console.error(e);
      setPageError('Delete failed. Check backend logs and permissions.');
    } finally {
      setLoading(false);
    }
  };

  const handleTrackAsset = (asset) => {
    navigate(`/tracking?asset=${asset.assetId}`);
  };

  const handleSubmitAsset = async (assetDataFromForm) => {
    if (!canManage) return;

    try {
      setPageError('');
      setLoading(true);

      const payload = toApiPayload(assetDataFromForm);

      if (editingAsset) {
        const updatedApiAsset = await assetService.updateAsset(editingAsset.id, payload);
        const updatedUi = toUiAsset(updatedApiAsset);
        setAssets((prev) => prev.map((a) => (a.id === editingAsset.id ? updatedUi : a)));
      } else {
        const createdApiAsset = await assetService.createAsset(payload);
        const createdUi = toUiAsset(createdApiAsset);
        setAssets((prev) => [createdUi, ...prev]);
      }

      setShowModal(false);
      setEditingAsset(null);
    } catch (e) {
      console.error(e);
      setPageError('Save failed. Check permissions and backend validation.');
    } finally {
      setLoading(false);
    }
  };

  if (!canRead) {
    return (
      <div className="asset-onboarding-layout">
        <Navbar toggleSidebar={toggleSidebar} />
        <div className="dashboard-container">
          <Sidebar isOpen={sidebarOpen} />
          <main className="dashboard-main">
            <div className="access-denied">
              <h2>Access Denied</h2>
              <p>You don't have permission to view assets.</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="asset-onboarding-layout">
      <Navbar toggleSidebar={toggleSidebar} />
      <div className="dashboard-container">
        <Sidebar isOpen={sidebarOpen} />
        <main className="dashboard-main">
          <div className="page-header">
            <div>
              <h1>Assets</h1>
              <p>
                {selectedStatus ? (
                  <>
                    Showing status: <b>{selectedStatus}</b>{' '}
                    <button
                      type="button"
                      className="clear-filter-btn"
                      onClick={() => navigate('/assets')}
                      style={{ marginLeft: 8 }}
                    >
                      Clear
                    </button>
                  </>
                ) : selectedType ? (
                  <>
                    Showing type: <b>{selectedType}</b>{' '}
                    <button
                      type="button"
                      className="clear-filter-btn"
                      onClick={() => navigate('/assets')}
                      style={{ marginLeft: 8 }}
                    >
                      Clear
                    </button>
                  </>
                ) : (
                  'All assets'
                )}
              </p>
            </div>

            {canManage && (
              <button className="add-asset-btn" onClick={handleAddAsset}>
                ➕ Add New Asset
              </button>
            )}
          </div>

          {pageError && (
            <div className="error-message" style={{ marginBottom: 12 }}>
              {pageError}
            </div>
          )}

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
          size="large"
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