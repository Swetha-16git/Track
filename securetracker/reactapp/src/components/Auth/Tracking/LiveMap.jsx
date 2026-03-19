import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './Tracking.css';

/** Fix marker icons in React builds */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

/** ✅ This makes the map MOVE when selectedAsset changes */
function RecenterMap({ lat, lng }) {
  const map = useMap();

  useEffect(() => {
    if (lat == null || lng == null) return;
    map.setView([lat, lng], 15, { animate: true });
  }, [lat, lng, map]);

  return null;
}

const LiveMap = ({ assets = [], selectedAsset, onAssetSelect }) => {
  const assetsWithLocation = useMemo(
    () => assets.filter((a) => a.last_latitude != null && a.last_longitude != null),
    [assets]
  );

  const selectedLat = selectedAsset?.last_latitude ?? null;
  const selectedLng = selectedAsset?.last_longitude ?? null;

  const defaultCenter = useMemo(() => {
    // If selected asset has coordinates, center there
    if (selectedLat != null && selectedLng != null) return [selectedLat, selectedLng];

    // Else center on first asset with coords
    if (assetsWithLocation.length > 0) {
      return [assetsWithLocation[0].last_latitude, assetsWithLocation[0].last_longitude];
    }

    // Fallback (India)
    return [20.5937, 78.9629];
  }, [selectedLat, selectedLng, assetsWithLocation]);

  return (
    <div className="live-map-container">
      <div className="map-header">
        <h3>Live Map</h3>
        <span className="map-status">🟢 Live</span>
      </div>

      <div className="map-view" style={{ height: 520 }}>
        <MapContainer center={defaultCenter} zoom={10} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* ✅ recenter when selected asset changes */}
          <RecenterMap lat={selectedLat} lng={selectedLng} />

          {assetsWithLocation.map((a) => (
            <Marker
              key={a.asset_id}
              position={[a.last_latitude, a.last_longitude]}
              eventHandlers={{ click: () => onAssetSelect && onAssetSelect(a) }}
            >
              <Popup>
                <div>
                  <b>{a.name}</b>
                  <br />
                  Asset ID: {a.asset_id}
                  <br />
                  Lat: {a.last_latitude}
                  <br />
                  Lng: {a.last_longitude}
                  <br />
                  Status: {a.status}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {assetsWithLocation.length === 0 && (
          <div style={{ padding: 12, opacity: 0.8 }}>
            No assets have coordinates yet. Update last_latitude/last_longitude in Asset Form.
          </div>
        )}

        {selectedAsset && (selectedLat == null || selectedLng == null) && (
          <div style={{ padding: 12, color: '#b91c1c' }}>
            Selected asset has no coordinates yet. Please update latitude/longitude for this asset.
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveMap;