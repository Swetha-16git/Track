import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import Navbar from "../components/Auth/Layout/Navbar/Navbar";
import Sidebar from "../components/Auth/Layout/Sidebar/Sidebar";
import Footer from "../components/Auth/Layout/Footer";

import AssetList from "../components/Auth/Assets/AssetList/AssetList";
import AssetForm from "../components/Auth/Assets/AssetForm/AssetForm";
import Modal from "../components/Auth/Common/Modal";

import { assetService } from "../services/assetService";
import "./AssetOnboarding.css";

const safeLower = (v) => String(v ?? "").toLowerCase();

/* API → UI */
const toUiAsset = (a) => ({
  id: a.id,
  assetId: a.asset_id,
  type: a.asset_type,
  status: a.status,
  make: a.make ?? "",
  model: a.model ?? "",
  year: a.year ?? "",
  licensePlate: a.license_plate ?? "",
  vin: a.vin ?? "",
  color: a.color ?? "",
  description: a.description ?? "",
  lastLatitude: a.last_latitude ?? null,
  lastLongitude: a.last_longitude ?? null,
  name: a.name ?? "",
});

const extractBackendError = (err) =>
  err?.response?.data?.detail || err?.message || "Action failed";

const AssetOnboarding = () => {
  const { hasPermission } = useAuth();
  const canRead = hasPermission("assets:read");
  const canManage = hasPermission("assets:write");

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const selectedStatus = searchParams.get("status");
  const selectedType = searchParams.get("type");

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);

 
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageError, setPageError] = useState("");

  const toggleSidebar = () => setSidebarOpen((p) => !p);

  /* Load assets */
  const loadAssets = async () => {
    try {
      setPageError("");
      setLoading(true);
      const res = await assetService.getAllAssets();
      setAssets(res.map(toUiAsset));
    } catch {
      setPageError("Failed to load assets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (canRead) loadAssets();
  }, [canRead]);

  /* Filters */
  const filteredAssets = useMemo(() => {
    let list = assets;
 
    if (selectedStatus) {
      list = list.filter((a) => safeLower(a.status) === safeLower(selectedStatus));
    } else if (selectedType) {
      list = list.filter((a) => safeLower(a.type) === safeLower(selectedType));
    }
 
    return list;
  }, [assets, selectedStatus, selectedType]);

  /* Actions */
 
  const handleEditAsset = (asset) => {
    setEditingAsset(asset);
    setShowModal(true);
  };
 
  const handleDeleteAsset = async (asset) => {
    if (!window.confirm(`Delete Asset ID "${asset.assetId}"?`)) return;
    try {
      setLoading(true);
      await assetService.deleteAsset(asset.id);
      setAssets((prev) => prev.filter((a) => a.id !== asset.id));
    } catch (e) {
      setPageError(extractBackendError(e));
    } finally {
      setLoading(false);
    }
  };
 
  const handleTrackAsset = (asset) => {
    navigate(`/tracking?asset=${asset.assetId}`);
  };

  const handleSubmitAsset = async (formData) => {
    if (!canManage) return;
 
    try {
      setPageError("");
      setLoading(true);

      if (!editingAsset) {
        const created = await assetService.createAsset(formData);
        setAssets((prev) => [toUiAsset(created), ...prev]);
      } else {
        const payload = { ...formData };
        delete payload.asset_id;
        const updated = await assetService.updateAsset(editingAsset.id, payload);
        setAssets((prev) =>
          prev.map((a) => (a.id === editingAsset.id ? toUiAsset(updated) : a))
        );
      }
 
      setShowModal(false);
      setEditingAsset(null);
    } catch (e) {
      setPageError(extractBackendError(e));
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
            <div>
              <h1>View Assets</h1>
              <p>
                {selectedStatus
                  ? `Showing status: ${selectedStatus}`
                  : selectedType
                  ? `Showing type: ${selectedType}`
                  : "All assets"}
              </p>
            </div>
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
          title={editingAsset ? "Edit Asset" : "Add Asset"}
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
 