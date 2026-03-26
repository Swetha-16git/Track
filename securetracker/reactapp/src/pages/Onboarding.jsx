import React, { useState } from "react";
// useNavigate removed - not used

import { useAuth } from "../context/AuthContext";

import Navbar from "../components/Auth/Layout/Navbar/Navbar";
import Sidebar from "../components/Auth/Layout/Sidebar/Sidebar";
import Footer from "../components/Auth/Layout/Footer";
import Modal from "../components/Auth/Common/Modal";
import AssetForm from "../components/Auth/Assets/AssetForm/AssetForm";
import { assetService } from "../services/assetService";
import AssetTypeForm from "../components/Auth/Assets/AssetTypeForm/AssetTypeForm";
import { assetTypeService } from "../services/assetTypeService";
import OEMForm from "../components/Auth/OEM/OEMForm/OEMForm";
import { oemService } from "../services/oemService";
import "./Onboarding.css";


const Onboarding = () => {
  const { hasPermission } = useAuth();
  const canManage = hasPermission("assets:write");

  const [sidebarOpen, setSidebarOpen] = useState(true);
const [showAssetModal, setShowAssetModal] = useState(false);
  const [showAssetTypeModal, setShowAssetTypeModal] = useState(false);
  const [showOEMModal, setShowOEMModal] = useState(false);
  const [editingAssetType, setEditingAssetType] = useState(null);

  const [loading, setLoading] = useState(false);
  const [pageError, setPageError] = useState("");

  const toggleSidebar = () => setSidebarOpen((p) => !p);

  const handleAddAsset = () => {
    if (!canManage) return;
    setShowAssetModal(true);
    setPageError("");
  };

  const handleAddAssetType = () => {
    if (!canManage) return;
    setEditingAssetType(null);
    setShowAssetTypeModal(true);
    setPageError("");
  };

  const handleSubmitAsset = async (formData) => {
    try {
      setPageError("");
      setLoading(true);
      const created = await assetService.createAsset(formData);
      alert("Asset created successfully!");
      setShowAssetModal(false);
    } catch (e) {
      setPageError(e?.response?.data?.detail || e?.message || "Failed to create asset");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAssetType = async (formData) => {
    try {
      setPageError("");
      setLoading(true);
      const created = await assetTypeService.createAssetType(formData);
      alert("Asset Type created successfully!");
      setShowAssetTypeModal(false);
    } catch (e) {
      setPageError(e?.response?.data?.detail || e?.message || "Failed to create asset type");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowAssetModal(false);
    setShowAssetTypeModal(false);
    setShowOEMModal(false);
  };

  const handleAddOEM = () => {
    if (!canManage) return;
    setShowOEMModal(true);
    setPageError("");
  };

  const handleSubmitOEM = async (formData) => {
    try {
      setPageError("");
      setLoading(true);
      const created = await oemService.createOEM(formData);
      alert("OEM created successfully!");
      setShowOEMModal(false);
    } catch (e) {
      setPageError(e?.response?.data?.detail || e?.message || "Failed to create OEM");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="asset-onboarding-layout">
      <Navbar toggleSidebar={toggleSidebar} />
      <div className="dashboard-container">
        <Sidebar isOpen={sidebarOpen} />
        <main className="dashboard-main">
          <div className="page-header">
            <div>
              <h1>Onboarding</h1>
              <p>Quick start with your assets and devices</p>
            </div>
          </div>

          {pageError && <div className="error-message">{pageError}</div>}

          <div className="onboarding-grid">
            <div 
              className="onboarding-card"
              onClick={handleAddOEM}
            >
              <h3>OEM Onboarding</h3>
              <p>Add new OEM provider configuration</p>
            </div>


            <div 
              className="onboarding-card"
              onClick={handleAddAssetType}
            >
              <h3>Add Asset Type</h3>
              <p>Add new equipment category/type</p>
            </div>

            <div className="onboarding-card card-coming-soon">
              <h3>Gateway Onboarding</h3>
              <p>Coming soon</p>
            </div>

            <div 
              className="onboarding-card"
              onClick={handleAddAsset}
            >
              <h3>Add Asset</h3>
              <p>Add new vehicle or equipment to track</p>
            </div>
          </div>

          <Footer />
        </main>
      </div>

{canManage && (
        <>
          <Modal
            isOpen={showAssetModal}
            onClose={handleCloseModal}
            title="Add New Asset"
            size="large"
          >
            <AssetForm
              asset={null}
              onSubmit={handleSubmitAsset}
              onCancel={handleCloseModal}
            />
          </Modal>
          <Modal
            isOpen={showAssetTypeModal}
            onClose={handleCloseModal}
            title="Add New Asset Type"
            size="large"
          >
            <AssetTypeForm
              assetType={editingAssetType}
              onSubmit={handleSubmitAssetType}
              onCancel={handleCloseModal}
            />
          </Modal>
          <Modal
            isOpen={showOEMModal}
            onClose={handleCloseModal}
            title="Add OEM Provider"
            size="large"
          >
            <OEMForm
              oem={null}
              onSubmit={handleSubmitOEM}
              onCancel={handleCloseModal}
            />
          </Modal>
        </>
      )}

    </div>
  );
};

export default Onboarding;

