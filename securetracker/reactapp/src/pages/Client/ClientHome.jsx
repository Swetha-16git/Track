import React, { useMemo, useState } from "react";


import { MapContainer, TileLayer, Marker, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Fix Leaflet marker icons in React builds
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const ClientHome = () => {
  const [hoveredSiteId, setHoveredSiteId] = useState(null);

  // UI-only dummy data (later you can load from API)
  const sites = useMemo(
    () => [
      {
        id: 1,
        name: "L&T Chennai Yard",
        lat: 13.0827,
        lng: 80.2707,
        assets: 18,
        activeAssets: 16,
        status: "Active",
        updated: "2 mins ago",
      },
      {
        id: 2,
        name: "L&T Bangalore Site",
        lat: 12.9716,
        lng: 77.5946,
        assets: 12,
        activeAssets: 10,
        status: "Active",
        updated: "5 mins ago",
      },
      {
        id: 3,
        name: "L&T Hyderabad Plant",
        lat: 17.385,
        lng: 78.4867,
        assets: 12,
        activeAssets: 12,
        status: "Active",
        updated: "Just now",
      },
    ],
    []
  );

  const hoveredSite = sites.find((s) => s.id === hoveredSiteId);

  const totals = useMemo(() => {
    const totalAssets = sites.reduce((a, s) => a + s.assets, 0);
    const activeAssets = sites.reduce((a, s) => a + s.activeAssets, 0);
    return {
      sites: sites.length,
      totalAssets,
      activeAssets,
      alerts: 2, // UI-only
    };
  }, [sites]);

  return (
    <div className="client-home">
      <div className="client-home-header">
        <h2>Client Home</h2>
        <div className="client-home-sub">
          Live overview of sites, assets and reports
        </div>
      </div>

      {/* ===== KPI CARDS (More content) ===== */}
      <div className="kpi-grid">
        <div className="kpi">
          <div className="kpi-label">Total Sites</div>
          <div className="kpi-value">{totals.sites}</div>
          <div className="kpi-foot">Configured locations</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Total Assets</div>
          <div className="kpi-value">{totals.totalAssets}</div>
          <div className="kpi-foot">Tracked equipment</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Active Assets</div>
          <div className="kpi-value">{totals.activeAssets}</div>
          <div className="kpi-foot">Currently online</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Alerts</div>
          <div className="kpi-value">{totals.alerts}</div>
          <div className="kpi-foot">Needs attention</div>
        </div>
      </div>

      {/* ===== REAL MAP (NO SIDE PANEL) ===== */}
      <div className="map-card">
        <div className="map-card-header">
          <div className="map-title">Live Site Map</div>
          <div className="map-hint">Hover a marker to see the site name</div>

          {/* Optional: small on-map hover pill */}
          <div className={`map-hover-pill ${hoveredSite ? "show" : ""}`}>
            {hoveredSite ? hoveredSite.name : ""}
          </div>
        </div>

        <div className="map-wrap">
          <MapContainer center={[20.5937, 78.9629]} zoom={5} scrollWheelZoom={true}>
            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {sites.map((site) => (
              <Marker
                key={site.id}
                position={[site.lat, site.lng]}
                eventHandlers={{
                  mouseover: () => setHoveredSiteId(site.id),
                  mouseout: () => setHoveredSiteId(null),
                }}
              >
                {/* ✅ Site name appears ON the map on hover */}
                <Tooltip
                  direction="top"
                  offset={[0, -12]}
                  opacity={1}
                  permanent={hoveredSiteId === site.id}
                  className="site-tooltip"
                >
                  <div className="tooltip-title">{site.name}</div>
                  <div className="tooltip-sub">
                    Assets: <strong>{site.assets}</strong> • {site.status}
                  </div>
                </Tooltip>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>

      {/* ===== MORE CONTENT BELOW MAP ===== */}
      <div className="below-grid">
        {/* Site Summary */}
        <div className="panel">
          <div className="panel-head">
            <div className="panel-title">Site Summary</div>
            <div className="panel-sub">Quick view of all sites</div>
          </div>

          <div className="site-list">
            {sites.map((s) => (
              <div
                key={s.id}
                className="site-row"
                onMouseEnter={() => setHoveredSiteId(s.id)}
                onMouseLeave={() => setHoveredSiteId(null)}
              >
                <div className="site-name">{s.name}</div>
                <div className="site-meta">
                  <span className="pill">{s.status}</span>
                  <span className="meta-text">
                    Assets: <strong>{s.assets}</strong> • Active:{" "}
                    <strong>{s.activeAssets}</strong>
                  </span>
                </div>
                <div className="site-updated">{s.updated}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Alerts */}
        <div className="panel">
          <div className="panel-head">
            <div className="panel-title">Recent Alerts</div>
            <div className="panel-sub">Latest system notifications</div>
          </div>

          <div className="alert-list">
            <div className="alert-item">
              <span className="alert-dot warn" />
              <div>
                <div className="alert-title">GPS signal intermittent</div>
                <div className="alert-sub">L&T Bangalore Site • 10 mins ago</div>
              </div>
            </div>
            <div className="alert-item">
              <span className="alert-dot info" />
              <div>
                <div className="alert-title">New asset onboarded</div>
                <div className="alert-sub">L&T Chennai Yard • 1 hour ago</div>
              </div>
            </div>
            <div className="alert-item">
              <span className="alert-dot ok" />
              <div>
                <div className="alert-title">Gateway online</div>
                <div className="alert-sub">L&T Hyderabad Plant • 2 hours ago</div>
              </div>
            </div>
          </div>

          <button className="btn-secondary">View All Alerts</button>
        </div>
      </div>

      {/* ===== REPORTS ===== */}
      <div className="reports-section">
        <div className="reports-head">
          <h3>Reports</h3>
          <div className="reports-sub">Generate and download operational reports</div>
        </div>

        <div className="report-grid">
          <div className="report-card">
            <div className="report-title">Asset Movement</div>
            <div className="report-desc">Track movement history across sites</div>
            <button className="btn-primary">Open</button>
          </div>

          <div className="report-card">
            <div className="report-title">Utilization</div>
            <div className="report-desc">Working vs idle time analysis</div>
            <button className="btn-primary">Open</button>
          </div>

          <div className="report-card">
            <div className="report-title">Idle Time</div>
            <div className="report-desc">Identify underutilized assets</div>
            <button className="btn-primary">Open</button>
          </div>

          <div className="report-card">
            <div className="report-title">Download Reports</div>
            <div className="report-desc">Export PDF/Excel (UI now)</div>
            <button className="btn-primary">Download</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientHome;