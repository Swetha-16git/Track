import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import Navbar from "../components/Auth/Layout/Navbar/Navbar";
import Sidebar from "../components/Auth/Layout/Sidebar/Sidebar";
import Footer from "../components/Auth/Layout/Footer";

import AssetList from "../components/Auth/Assets/AssetList/AssetList";
import AssetForm from "../components/Auth/Assets/AssetForm/AssetForm";
import Modal from "../components/Auth/Common/Modal";

import assetService from "../services/assetService";

import "./AssetOnboarding.css";

const AssetOnboarding = () => {
  const { hasPermission } = useAuth();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);

  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canWrite =
    typeof hasPermission === "function"
      ? hasPermission("assets:write") || hasPermission("manage_assets")
      : true; // fallback; backend will still enforce

  const toggleSidebar = () => setSidebarOpen((v) => !v);

  const fetchAssets = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await assetService.getAllAssets();
      const list = Array.isArray(data) ? data : data?.items || data?.data || [];
      setAssets(list);
    } catch (e) {
      setError("Failed to load assets. Please login again and check token.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const handleAddAsset = () => {
    setEditingAsset(null);
    setShowModal(true);
  };

  const handleEditAsset = (asset) => {
    setEditingAsset(asset);
    setShowModal(true);
  };

  const handleDeleteAsset = async (asset) => {
    const id = asset?.asset_id || asset?.assetId || asset?.id;
    if (!id) return;

    if (!window.confirm(`Delete "${asset?.name}"?`)) return;

    setLoading(true);
    setError("");
    try {
      await assetService.deleteAsset(id);
      await fetchAssets();
    } catch (e) {
      setError(e?.response?.data?.detail || "Failed to delete asset.");
    } finally {
      setLoading(false);
    }
  };

  const handleTrackAsset = (asset) => {
    const id = asset?.asset_id || asset?.assetId || asset?.id;
    navigate(`/tracking?asset=${id}`);
  };

  const handleSubmitAsset = async (payload) => {
    setLoading(true);
    setError("");

    try {
      // ✅ Split location out
      const { latitude, longitude, ...assetPayload } = payload;

      // ✅ IMPORTANT: Do NOT send lat/lon in createAsset payload
      let saved;
      const editId =
        editingAsset?.asset_id || editingAsset?.assetId || editingAsset?.id;

      if (editId) {
        saved = await assetService.updateAsset(editId, assetPayload);
      } else {
        saved = await assetService.createAsset(assetPayload);
      }

      const assetId = saved?.asset_id || assetPayload.asset_id || editId;

      // ✅ Save location separately (only if provided)
      const latNum =
        latitude === "" || latitude === null || latitude === undefined
          ? null
          : Number(latitude);
      const lonNum =
        longitude === "" || longitude === null || longitude === undefined
          ? null
          : Number(longitude);

      if (
        assetId &&
        Number.isFinite(latNum) &&
        Number.isFinite(lonNum)
      ) {
        await assetService.updateAssetLocation(assetId, {
          latitude: latNum,
          longitude: lonNum,
        });
      }

      setShowModal(false);
      setEditingAsset(null);
      await fetchAssets();
    } catch (e) {
      const msg = e?.response?.data?.detail || "Failed to save asset.";
      // Helpful permission message
      if (String(msg).includes("assets:write")) {
        setError("You don't have permission to create/update assets (assets:write). Login as admin/manager.");
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  if (typeof hasPermission === "function" && !hasPermission("manage_assets")) {
    return (
      <div className="asset-onboarding-layout">
        <Navbar toggleSidebar={toggleSidebar} />
        <div className="dashboard-container">
          <Sidebar isOpen={sidebarOpen} />
          <main className="dashboard-main">
            <div className="access-denied">
              <h2>Access Denied</h2>
              <p>You don't have permission to access asset management.</p>
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
              <h1>Asset Onboarding</h1>
              <p>Manage and onboard your vehicle assets</p>
            </div>

            <button
              className="add-asset-btn"
              onClick={handleAddAsset}
              disabled={!canWrite}
              title={!canWrite ? "Requires assets:write" : "Add asset"}
              style={!canWrite ? { opacity: 0.6, cursor: "not-allowed" } : undefined}
            >
              ➕ Add New Asset
            </button>
          </div>

          {error ? (
            <div
              style={{
                marginBottom: 14,
                padding: "10px 12px",
                borderRadius: 10,
                background: "#fdecec",
                border: "1px solid #f5c2c7",
                color: "#842029",
                fontWeight: 700,
              }}
            >
              {error}
            </div>
          ) : null}

          <AssetList
            assets={assets}
            loading={loading}
            onEdit={handleEditAsset}
            onDelete={handleDeleteAsset}
            onTrack={handleTrackAsset}
          />

          <Footer />
        </main>
      </div>

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
    </div>
  );
};

export default AssetOnboarding;