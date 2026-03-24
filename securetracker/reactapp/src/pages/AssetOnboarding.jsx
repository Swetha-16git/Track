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

/* -------------------------------
   API → UI mapping
-------------------------------- */
const toUiAsset = (a) => ({
  id: a.id, // DB primary key
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

/* -------------------------------
   Error extraction
-------------------------------- */
const extractBackendError = (err) => {
  const detail = err?.response?.data?.detail;
  if (typeof detail === "string") return detail;
  return err?.message || "Save failed";
};

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

  /* -------------------------------
     Load assets
  -------------------------------- */
  const loadAssets = async () => {
    try {
      setPageError("");
      setLoading(true);
      const res = await assetService.getAllAssets();
      setAssets(res.map(toUiAsset));
    } catch (e) {
      console.error(e);
      setPageError("Failed to load assets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (canRead) loadAssets();
  }, [canRead]);

  /* -------------------------------
     Filters
  -------------------------------- */
  const filteredAssets = useMemo(() => {
    let list = assets;

    if (selectedStatus) {
      list = list.filter(
        (a) => safeLower(a.status) === safeLower(selectedStatus)
      );
    } else if (selectedType) {
      list = list.filter(
        (a) => safeLower(a.type) === safeLower(selectedType)
      );
    }

    return list;
  }, [assets, selectedStatus, selectedType]);

  /* -------------------------------
     Actions
  -------------------------------- */
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
    if (!window.confirm(`Delete Asset ID "${asset.assetId}"?`)) return;

    try {
      setLoading(true);
      await assetService.deleteAsset(asset.id);
      setAssets((prev) => prev.filter((a) => a.id !== asset.id));
    } catch (e) {
      console.error(e);
      setPageError(extractBackendError(e));
    } finally {
      setLoading(false);
    }
  };

  const handleTrackAsset = (asset) => {
    navigate(`/tracking?asset=${asset.assetId}`);
  };

  /* -------------------------------
     ✅ FIXED SUBMIT LOGIC
  -------------------------------- */
  const handleSubmitAsset = async (formData) => {
    if (!canManage) return;

    try {
      setPageError("");
      setLoading(true);

      if (!editingAsset) {
        // ✅ CREATE → asset_id MUST be sent
        if (!formData.asset_id) {
          throw new Error("asset_id is required");
        }

        const created = await assetService.createAsset(formData);
        setAssets((prev) => [toUiAsset(created), ...prev]);
      } else {
        // ✅ UPDATE → NEVER send asset_id
        const updatePayload = { ...formData };
        delete updatePayload.asset_id;

        const updated = await assetService.updateAsset(
          editingAsset.id,
          updatePayload
        );

        setAssets((prev) =>
          prev.map((a) => (a.id === editingAsset.id ? toUiAsset(updated) : a))
        );
      }

      setShowModal(false);
      setEditingAsset(null);
    } catch (e) {
      console.error(e);
      setPageError(extractBackendError(e));
    } finally {
      setLoading(false);
    }
  };

  /* -------------------------------
     Access denied
  -------------------------------- */
  if (!canRead) {
    return <div>Access Denied</div>;
  }

  /* -------------------------------
     UI
  -------------------------------- */
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
                {selectedStatus
                  ? `Showing status: ${selectedStatus}`
                  : selectedType
                  ? `Showing type: ${selectedType}`
                  : "All assets"}
              </p>
            </div>

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
          title={editingAsset ? "Edit Asset" : "Add New Asset"}
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