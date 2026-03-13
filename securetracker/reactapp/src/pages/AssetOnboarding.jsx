import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import Navbar from '../components/Auth/Layout/Navbar/Navbar';
import Sidebar from '../components/Auth/Layout/Sidebar/Sidebar';
import Footer from '../components/Auth/Layout/Footer';

import AssetList from '../components/Auth/Assets/AssetList/AssetList';
import AssetForm from '../components/Auth/Assets/AssetForm/AssetForm';
import Modal from '../components/Auth/Common/Modal';

import { assetService } from '../services/assetService'; // ✅ make sure path matches your project
import './AssetOnboarding.css';

/**
 * Backend (FastAPI) returns keys like:
 *  asset_id, asset_type, license_plate
 * UI expects:
 *  assetId, type, licensePlate
 */
const toUiAsset = (a) => ({
  id: a.id, // numeric DB id
  assetId: a.asset_id,
  name: a.name,
  description: a.description ?? '',
  type: a.asset_type, // car/bike/truck/motorcycle/other (enum)
  status: a.status,   // active/inactive/maintenance/stolen (enum)
  make: a.make ?? '',
  model: a.model ?? '',
  year: a.year ?? '',
  licensePlate: a.license_plate ?? '',
  vin: a.vin ?? '',
  color: a.color ?? '',
  lastLatitude: a.last_latitude ?? null,
  lastLongitude: a.last_longitude ?? null,
});

const toApiPayload = (ui) => ({
  // Map UI fields to backend expected fields
  name: ui.name,
  description: ui.description ?? null,

  // IMPORTANT: must match your enums exactly
  asset_type: ui.type || ui.asset_type || 'car',
  status: ui.status || 'active',

  make: ui.make ?? null,
  model: ui.model ?? null,
  year: ui.year ? Number(ui.year) : null,
  license_plate: ui.licensePlate ?? null,
  vin: ui.vin ?? null,
  color: ui.color ?? null,
});

const AssetOnboarding = () => {
  const { hasPermission } = useAuth();
  const canRead = hasPermission('read');
  const canManage = hasPermission('manage_assets');

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedType = searchParams.get('type'); // car | bike | truck | motorcycle | other | null

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);

  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageError, setPageError] = useState('');

  // ✅ Start empty; load from backend
  const [assets, setAssets] = useState([]);

  const toggleSidebar = () => setSidebarOpen((p) => !p);

  // ✅ Load assets from backend
  useEffect(() => {
    const loadAssets = async () => {
      try {
        setPageError('');
        setLoading(true);

        const apiAssets = await assetService.getAllAssets(); // returns array
        setAssets(apiAssets.map(toUiAsset));
      } catch (e) {
        console.error(e);
        setPageError('Failed to load assets from backend. Check backend is running + token + CORS.');
      } finally {
        setLoading(false);
      }
    };

    if (canRead) loadAssets();
  }, [canRead]);

  // ✅ Filter by navbar dropdown (query param ?type=car)
  const filteredAssets = useMemo(() => {
    if (!selectedType) return assets;
    return assets.filter((a) => a.type === selectedType);
  }, [assets, selectedType]);

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

    if (!window.confirm(`Are you sure you want to delete "${asset.name}"?`)) return;

    try {
      setLoading(true);
      await assetService.deleteAsset(asset.id); // ✅ numeric id
      setAssets((prev) => prev.filter((a) => a.id !== asset.id));
    } catch (e) {
      console.error(e);
      setPageError('Delete failed. Check backend logs and permissions.');
    } finally {
      setLoading(false);
    }
  };

  const handleTrackAsset = (asset) => {
    // tracking page can use assetId string like ASSET001
    navigate(`/tracking?asset=${asset.assetId}`);
  };

  const handleSubmitAsset = async (assetDataFromForm) => {
    if (!canManage) return;

    try {
      setPageError('');
      setLoading(true);

      const payload = toApiPayload(assetDataFromForm);

      if (editingAsset) {
        // ✅ update uses numeric id
        const updatedApiAsset = await assetService.updateAsset(editingAsset.id, payload);

        // normalize to UI shape
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
      setPageError(
        'Save failed. Most common causes: enum mismatch (asset_type/status), missing token, CORS, or backend validation.'
      );
    } finally {
      setLoading(false);
    }
  };

  // ✅ READ permission gate (not manage gate)
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
                {selectedType ? (
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
                  'All asset types'
                )}
              </p>
            </div>

            {canManage && (
              <button className="add-asset-btn" onClick={handleAddAsset}>
                ➕ Add New Asset
              </button>
            )}
          </div>

          {/* ✅ Show API error if any */}
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

      {/* ✅ Modal only for manage permission */}
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
// import React, { useMemo, useState } from 'react';
// import { useNavigate, useSearchParams } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
// import Navbar from '../components/Auth/Layout/Navbar/Navbar';
// import Sidebar from '../components/Auth/Layout/Sidebar/Sidebar';
// import Footer from '../components/Auth/Layout/Footer';
// import AssetList from '../components/Auth/Assets/AssetList/AssetList';
// import AssetForm from '../components/Auth/Assets/AssetForm/AssetForm';
// import Modal from '../components/Auth/Common/Modal';
// import './AssetOnboarding.css';

// const AssetOnboarding = () => {
//   const { hasPermission } = useAuth();
//   const canRead = hasPermission('read');
//   const canManage = hasPermission('manage_assets');

//   const navigate = useNavigate();
//   const [searchParams] = useSearchParams();
//   const selectedType = searchParams.get('type'); // car | bike | truck | null

//   const [sidebarOpen, setSidebarOpen] = useState(true);
//   const [showModal, setShowModal] = useState(false);
//   const [editingAsset, setEditingAsset] = useState(null);
//   const [loading, setLoading] = useState(false);

//   const [assets, setAssets] = useState([
//     { id: 1, assetId: 'ASSET001', name: 'Toyota Camry', type: 'car', model: 'Camry', year: 2023, licensePlate: 'ABC-1234', status: 'active', color: 'Silver' },
//     { id: 2, assetId: 'ASSET002', name: 'Honda Civic', type: 'car', model: 'Civic', year: 2022, licensePlate: 'XYZ-5678', status: 'active', color: 'Black' },
//     { id: 3, assetId: 'ASSET003', name: 'Ford F-150', type: 'truck', model: 'F-150', year: 2023, licensePlate: 'DEF-9012', status: 'maintenance', color: 'Blue' },
//     { id: 4, assetId: 'ASSET004', name: 'Yamaha MT-07', type: 'bike', model: 'MT-07', year: 2023, licensePlate: 'MOTO-001', status: 'active', color: 'Black' },
//     { id: 5, assetId: 'ASSET005', name: 'Tesla Model 3', type: 'car', model: 'Model 3', year: 2023, licensePlate: 'TES-1234', status: 'active', color: 'White' },
//   ]);

//   const filteredAssets = useMemo(() => {
//     if (!selectedType) return assets;
//     return assets.filter((a) => a.type === selectedType);
//   }, [assets, selectedType]);

//   const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

//   const handleAddAsset = () => {
//     if (!canManage) return;
//     setEditingAsset(null);
//     setShowModal(true);
//   };

//   const handleEditAsset = (asset) => {
//     if (!canManage) return;
//     setEditingAsset(asset);
//     setShowModal(true);
//   };

//   const handleDeleteAsset = (asset) => {
//     if (!canManage) return;
//     if (window.confirm(`Are you sure you want to delete "${asset.name}"?`)) {
//       setAssets(assets.filter((a) => a.id !== asset.id));
//     }
//   };

//   const handleTrackAsset = (asset) => {
//     navigate(`/tracking?asset=${asset.assetId}`);
//   };

//   const handleSubmitAsset = async (assetData) => {
//     if (!canManage) return;
//     setLoading(true);

//     await new Promise((resolve) => setTimeout(resolve, 1000));

//     if (editingAsset) {
//       setAssets(
//         assets.map((a) => (a.id === editingAsset.id ? { ...a, ...assetData } : a))
//       );
//     } else {
//       const newAsset = {
//         ...assetData,
//         id: assets.length + 1,
//         assetId: `ASSET${String(assets.length + 1).padStart(3, '0')}`,
//       };
//       setAssets([...assets, newAsset]);
//     }

//     setLoading(false);
//     setShowModal(false);
//     setEditingAsset(null);
//   };

//   // ✅ Read permission gate (not manage gate)
//   if (!canRead) {
//     return (
//       <div className="asset-onboarding-layout">
//         <Navbar toggleSidebar={toggleSidebar} />
//         <div className="dashboard-container">
//           <Sidebar isOpen={sidebarOpen} />
//           <main className="dashboard-main">
//             <div className="access-denied">
//               <h2>Access Denied</h2>
//               <p>You don't have permission to view assets.</p>
//             </div>
//           </main>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="asset-onboarding-layout">
//       <Navbar toggleSidebar={toggleSidebar} />
//       <div className="dashboard-container">
//         <Sidebar isOpen={sidebarOpen} />
//         <main className="dashboard-main">
//           <div className="page-header">
//             <div>
//               <h1>Assets</h1>
//               <p>
//                 {selectedType ? (
//                   <>
//                     Showing type: <b>{selectedType}</b>{' '}
//                     <button
//                       type="button"
//                       className="clear-filter-btn"
//                       onClick={() => navigate('/assets')}
//                       style={{ marginLeft: 8 }}
//                     >
//                       Clear
//                     </button>
//                   </>
//                 ) : (
//                   'All asset types'
//                 )}
//               </p>
//             </div>

//             {/* ✅ Only show Add button if manage permission */}
//             {canManage && (
//               <button className="add-asset-btn" onClick={handleAddAsset}>
//                 ➕ Add New Asset
//               </button>
//             )}
//           </div>

//           <AssetList
//             assets={filteredAssets}
//             loading={loading}
//             onEdit={canManage ? handleEditAsset : undefined}
//             onDelete={canManage ? handleDeleteAsset : undefined}
//             onTrack={handleTrackAsset}
//             canManage={canManage}  // ✅ add this if you want AssetList to hide buttons
//           />

//           <Footer />
//         </main>
//       </div>

//       {/* ✅ Only open modal if manage */}
//       {canManage && (
//         <Modal
//           isOpen={showModal}
//           onClose={() => setShowModal(false)}
//           title={editingAsset ? 'Edit Asset' : 'Add New Asset'}
//           size="large"
//         >
//           <AssetForm
//             asset={editingAsset}
//             onSubmit={handleSubmitAsset}
//             onCancel={() => setShowModal(false)}
//           />
//         </Modal>
//       )}
//     </div>
//   );
// };

//export default AssetOnboarding;
// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
// import Navbar from '../components/Auth/Layout/Navbar/Navbar';
// import Sidebar from '../components/Auth/Layout/Sidebar/Sidebar';
// import Footer from '../components/Auth/Layout/Footer';
// import AssetList from '../components/Auth/Assets/AssetList/AssetList';
// import AssetForm from '../components/Auth/Assets/AssetForm/AssetForm';
// import Modal from '../components/Auth/Common/Modal';
// import './AssetOnboarding.css';

// const AssetOnboarding = () => {
// const { hasPermission } = useAuth();
//   const navigate = useNavigate();
//   const [sidebarOpen, setSidebarOpen] = useState(true);
//   const [showModal, setShowModal] = useState(false);
//   const [editingAsset, setEditingAsset] = useState(null);
//   const [loading, setLoading] = useState(false);

//   // Mock assets data
//   const [assets, setAssets] = useState([
//     { id: 1, assetId: 'ASSET001', name: 'Toyota Camry', type: 'car', model: 'Camry', year: 2023, licensePlate: 'ABC-1234', status: 'active', color: 'Silver' },
//     { id: 2, assetId: 'ASSET002', name: 'Honda Civic', type: 'car', model: 'Civic', year: 2022, licensePlate: 'XYZ-5678', status: 'active', color: 'Black' },
//     { id: 3, assetId: 'ASSET003', name: 'Ford F-150', type: 'truck', model: 'F-150', year: 2023, licensePlate: 'DEF-9012', status: 'maintenance', color: 'Blue' },
//     { id: 4, assetId: 'ASSET004', name: 'Yamaha MT-07', type: 'bike', model: 'MT-07', year: 2023, licensePlate: 'MOTO-001', status: 'active', color: 'Black' },
//     { id: 5, assetId: 'ASSET005', name: 'Tesla Model 3', type: 'car', model: 'Model 3', year: 2023, licensePlate: 'TES-1234', status: 'active', color: 'White' },
//   ]);

//   const toggleSidebar = () => {
//     setSidebarOpen(!sidebarOpen);
//   };

//   const handleAddAsset = () => {
//     setEditingAsset(null);
//     setShowModal(true);
//   };

//   const handleEditAsset = (asset) => {
//     setEditingAsset(asset);
//     setShowModal(true);
//   };

//   const handleDeleteAsset = (asset) => {
//     if (window.confirm(`Are you sure you want to delete "${asset.name}"?`)) {
//       setAssets(assets.filter((a) => a.id !== asset.id));
//     }
//   };

//   const handleTrackAsset = (asset) => {
//     navigate(`/tracking?asset=${asset.assetId}`);
//   };

//   const handleSubmitAsset = async (assetData) => {
//     setLoading(true);
    
//     // Simulate API call
//     await new Promise((resolve) => setTimeout(resolve, 1000));
    
//     if (editingAsset) {
//       // Update existing asset
//       setAssets(assets.map((a) => 
//         a.id === editingAsset.id ? { ...a, ...assetData } : a
//       ));
//     } else {
//       // Add new asset
//       const newAsset = {
//         ...assetData,
//         id: assets.length + 1,
//         assetId: `ASSET${String(assets.length + 1).padStart(3, '0')}`,
//       };
//       setAssets([...assets, newAsset]);
//     }
    
//     setLoading(false);
//     setShowModal(false);
//     setEditingAsset(null);
//   };

//   if (!hasPermission('manage_assets')) {
//     return (
//       <div className="asset-onboarding-layout">
//         <Navbar toggleSidebar={toggleSidebar} />
//         <div className="dashboard-container">
//           <Sidebar isOpen={sidebarOpen} />
//           <main className="dashboard-main">
//             <div className="access-denied">
//               <h2>Access Denied</h2>
//               <p>You don't have permission to access asset management.</p>
//             </div>
//           </main>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="asset-onboarding-layout">
//       <Navbar toggleSidebar={toggleSidebar} />
//       <div className="dashboard-container">
//         <Sidebar isOpen={sidebarOpen} />
//         <main className="dashboard-main">
//           <div className="page-header">
//             <div>
//               <h1>Asset Onboarding</h1>
//               <p>Manage and onboard your vehicle assets</p>
//             </div>
//             <button className="add-asset-btn" onClick={handleAddAsset}>
//               ➕ Add New Asset
//             </button>
//           </div>

//           <AssetList
//             assets={assets}
//             loading={loading}
//             onEdit={handleEditAsset}
//             onDelete={handleDeleteAsset}
//             onTrack={handleTrackAsset}
//           />

//           <Footer />
//         </main>
//       </div>

//       <Modal
//         isOpen={showModal}
//         onClose={() => setShowModal(false)}
//         title={editingAsset ? 'Edit Asset' : 'Add New Asset'}
//         size="large"
//       >
//         <AssetForm
//           asset={editingAsset}
//           onSubmit={handleSubmitAsset}
//           onCancel={() => setShowModal(false)}
//         />
//       </Modal>
//     </div>
//   );
// };

// export default AssetOnboarding;

