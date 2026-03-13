import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Auth/Layout/Navbar/Navbar';
import Sidebar from '../components/Auth/Layout/Sidebar/Sidebar';
import Footer from '../components/Auth/Layout/Footer';
import AssetList from '../components/Auth/Assets/AssetList/AssetList';
import AssetForm from '../components/Auth/Assets/AssetForm/AssetForm';
import Modal from '../components/Auth/Common/Modal';
import './AssetOnboarding.css';

const AssetOnboarding = () => {
const { hasPermission } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [loading, setLoading] = useState(false);

  // Mock assets data
  const [assets, setAssets] = useState([
    { id: 1, assetId: 'ASSET001', name: 'Toyota Camry', type: 'car', model: 'Camry', year: 2023, licensePlate: 'ABC-1234', status: 'active', color: 'Silver' },
    { id: 2, assetId: 'ASSET002', name: 'Honda Civic', type: 'car', model: 'Civic', year: 2022, licensePlate: 'XYZ-5678', status: 'active', color: 'Black' },
    { id: 3, assetId: 'ASSET003', name: 'Ford F-150', type: 'truck', model: 'F-150', year: 2023, licensePlate: 'DEF-9012', status: 'maintenance', color: 'Blue' },
    { id: 4, assetId: 'ASSET004', name: 'Yamaha MT-07', type: 'bike', model: 'MT-07', year: 2023, licensePlate: 'MOTO-001', status: 'active', color: 'Black' },
    { id: 5, assetId: 'ASSET005', name: 'Tesla Model 3', type: 'car', model: 'Model 3', year: 2023, licensePlate: 'TES-1234', status: 'active', color: 'White' },
  ]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleAddAsset = () => {
    setEditingAsset(null);
    setShowModal(true);
  };

  const handleEditAsset = (asset) => {
    setEditingAsset(asset);
    setShowModal(true);
  };

  const handleDeleteAsset = (asset) => {
    if (window.confirm(`Are you sure you want to delete "${asset.name}"?`)) {
      setAssets(assets.filter((a) => a.id !== asset.id));
    }
  };

  const handleTrackAsset = (asset) => {
    navigate(`/tracking?asset=${asset.assetId}`);
  };

  const handleSubmitAsset = async (assetData) => {
    setLoading(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    if (editingAsset) {
      // Update existing asset
      setAssets(assets.map((a) => 
        a.id === editingAsset.id ? { ...a, ...assetData } : a
      ));
    } else {
      // Add new asset
      const newAsset = {
        ...assetData,
        id: assets.length + 1,
        assetId: `ASSET${String(assets.length + 1).padStart(3, '0')}`,
      };
      setAssets([...assets, newAsset]);
    }
    
    setLoading(false);
    setShowModal(false);
    setEditingAsset(null);
  };

  if (!hasPermission('manage_assets')) {
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
            <button className="add-asset-btn" onClick={handleAddAsset}>
              ➕ Add New Asset
            </button>
          </div>

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
        title={editingAsset ? 'Edit Asset' : 'Add New Asset'}
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

