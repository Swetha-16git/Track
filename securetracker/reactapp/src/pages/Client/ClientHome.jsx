import React, { useMemo } from "react";
import "./ClientHome.css";

import { MapContainer, TileLayer, Marker, Tooltip, ZoomControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

/* Fix Leaflet marker icons */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

/* Inline SVG -> image (no extra files) */
const svgData = (svg) => `data:image/svg+xml,${encodeURIComponent(svg)}`;

const ICONS = {
  sites: svgData(`
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none">
      <path d="M4 10.5 12 5l8 5.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-9.5Z" fill="#0b3a6f" opacity="0.12"/>
      <path d="M12 3.8 2.8 10.1a1 1 0 0 0 .6 1.85H5v8.8a1.2 1.2 0 0 0 1.2 1.2h11.6A1.2 1.2 0 0 0 19 20.75V12h1.6a1 1 0 0 0 .6-1.85L12 3.8Z" stroke="#0b3a6f" stroke-width="1.6" stroke-linejoin="round"/>
      <path d="M9.2 21v-6.2a1 1 0 0 1 1-1h3.6a1 1 0 0 1 1 1V21" stroke="#0b3a6f" stroke-width="1.6" stroke-linecap="round"/>
    </svg>
  `),

  totalAssets: svgData(`
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none">
      <rect x="4" y="6" width="16" height="12" rx="2.5" fill="#0b3a6f" opacity="0.12"/>
      <path d="M7 18h10a3 3 0 0 0 3-3V9a3 3 0 0 0-3-3H7a3 3 0 0 0-3 3v6a3 3 0 0 0 3 3Z" stroke="#0b3a6f" stroke-width="1.6"/>
      <path d="M9 12h6" stroke="#0b3a6f" stroke-width="1.6" stroke-linecap="round"/>
      <path d="M12 9v6" stroke="#0b3a6f" stroke-width="1.6" stroke-linecap="round"/>
    </svg>
  `),

  active: svgData(`
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none">
      <circle cx="12" cy="12" r="9" fill="#16a34a" opacity="0.12"/>
      <path d="M8.5 12.2 11 14.7l4.8-5.2" stroke="#16a34a" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" stroke="#16a34a" stroke-width="1.6"/>
    </svg>
  `),

  notReporting: svgData(`
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none">
      <path d="M12 3 2.8 20a1.3 1.3 0 0 0 1.15 1.95h16.1A1.3 1.3 0 0 0 21.2 20L12 3Z" fill="#dc2626" opacity="0.12"/>
      <path d="M12 9v4.7" stroke="#dc2626" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M12 17.5h.01" stroke="#dc2626" stroke-width="3.2" stroke-linecap="round"/>
      <path d="M12 3 2.8 20a1.3 1.3 0 0 0 1.15 1.95h16.1A1.3 1.3 0 0 0 21.2 20L12 3Z" stroke="#dc2626" stroke-width="1.6" stroke-linejoin="round"/>
    </svg>
  `),

  connections: svgData(`
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none">
      <path d="M7.6 14.2 5 16.8a3 3 0 1 0 4.2 4.2l2.6-2.6" stroke="#2563eb" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M16.4 9.8 19 7.2A3 3 0 0 0 14.8 3l-2.6 2.6" stroke="#2563eb" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M9.7 14.3l4.6-4.6" stroke="#2563eb" stroke-width="1.8" stroke-linecap="round"/>
      <circle cx="12" cy="12" r="9" fill="#2563eb" opacity="0.08"/>
    </svg>
  `),

  batching: svgData(`
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none">
      <rect x="3" y="4" width="14" height="13" rx="2.5" fill="#0b3a6f" opacity="0.12"/>
      <path d="M6 16V8l3-3h5v11" stroke="#0b3a6f" stroke-width="1.6" stroke-linejoin="round"/>
      <path d="M7.5 11h2.5" stroke="#0b3a6f" stroke-width="1.6" stroke-linecap="round"/>
    </svg>
  `),

  crane: svgData(`
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none">
      <path d="M4 16h12" stroke="#0b3a6f" stroke-width="1.6" stroke-linecap="round"/>
      <path d="M6 16V5h3l6 4" stroke="#0b3a6f" stroke-width="1.6" stroke-linejoin="round"/>
      <path d="M9 5v8" stroke="#0b3a6f" stroke-width="1.6" stroke-linecap="round"/>
      <circle cx="15" cy="9" r="1" fill="#0b3a6f"/>
    </svg>
  `),

  roller: svgData(`
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none">
      <rect x="5" y="8" width="8" height="5" rx="1" fill="#0b3a6f" opacity="0.12"/>
      <path d="M6 13h10" stroke="#0b3a6f" stroke-width="1.6" stroke-linecap="round"/>
      <circle cx="6.5" cy="14.5" r="1.8" stroke="#0b3a6f" stroke-width="1.4"/>
      <circle cx="15.5" cy="14.5" r="1.8" stroke="#0b3a6f" stroke-width="1.4"/>
    </svg>
  `),

  loader: svgData(`
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none">
      <path d="M4 14h8l2-4H7" stroke="#0b3a6f" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="6.2" cy="15.3" r="1.5" stroke="#0b3a6f" stroke-width="1.4"/>
      <circle cx="12.7" cy="15.3" r="1.5" stroke="#0b3a6f" stroke-width="1.4"/>
      <path d="M14 10l3-1v3l-3 1" stroke="#0b3a6f" stroke-width="1.6" stroke-linejoin="round"/>
    </svg>
  `),

  pump: svgData(`
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none">
      <path d="M5 15V8a2 2 0 0 1 2-2h5a2 2 0 0 1 2 2v7" stroke="#0b3a6f" stroke-width="1.6" stroke-linejoin="round"/>
      <path d="M7 9h7" stroke="#0b3a6f" stroke-width="1.6" stroke-linecap="round"/>
      <path d="M12 6V4" stroke="#0b3a6f" stroke-width="1.6" stroke-linecap="round"/>
    </svg>
  `),
};

const ClientHome = () => {
  const sites = useMemo(
  () => [
    { id: 1, name: "Chennai Yard", lat: 13.08, lng: 80.27, assets: 22, active: 19 },
    { id: 2, name: "Bangalore Site", lat: 12.97, lng: 77.59, assets: 15, active: 12 },
    { id: 3, name: "Hyderabad Plant", lat: 17.38, lng: 78.48, assets: 11, active: 9 },
  ],
  []
);

  const assetTypes = useMemo(
  () => [
    {
      id: 1,
      name: "Tower Crane",
      value: "7 / 21",
      icon: ICONS.crane,
    },
    {
      id: 2,
      name: "Excavator",
      value: "8 / 20",
      icon: ICONS.loader, // reused icon, no new files
    },
    {
      id: 3,
      name: "Batching Plant",
      value: "14 / 32",
      icon: ICONS.batching,
    },
    {
      id: 4,
      name: "Wheel Loader",
      value: "11 / 26",
      icon: ICONS.loader,
    },
    {
      id: 5,
      name: "Dump Truck",
      value: "9 / 24",
      icon: ICONS.connections, // reused icon
    },
    {
      id: 6,
      name: "Road Roller",
      value: "9 / 18",
      icon: ICONS.roller,
    },
    {
      id: 7,
      name: "Concrete Pump",
      value: "6 / 14",
      icon: ICONS.pump,
    },
  ],
  []
);

  const totals = useMemo(() => {
    const totalAssets = sites.reduce((sum, s) => sum + s.assets, 0);
    const activeAssets = sites.reduce((sum, s) => sum + s.active, 0);

    // Demo numbers to match your UI expectation
    const notReporting = Math.max(0, totalAssets - activeAssets); // basic demo logic
    const connections = "5 / 6"; // gateways reporting

    return {
      sites: sites.length,
      totalAssets,
      activeAssets,
      notReporting,
      connections,
    };
  }, [sites]);

  return (
    <div className="client-home">
      <div className="client-home-inner">
        <div className="client-layout">

          {/* LEFT : SITES + MAP + KPI */}
          <div className="sites-panel">
            <div className="panel-header">
              <div className="panel-title">
                <div className="panel-title-left">
                  <img className="title-ico" src={ICONS.sites} alt="sites" />
                  <div>
                    <h3>Sites</h3>
                    <span className="sub">{totals.sites} sites</span>
                  </div>
                </div>

                <div className="pill live">
                  <span className="dot" />
                  Live
                </div>
              </div>
            </div>

            <div className="map-wrapper">
              <MapContainer
                center={[20.59, 78.96]}
                zoom={5}
                zoomControl={false}
                style={{ height: "100%", width: "100%" }}
              >
                {/* ✅ English-friendly basemap */}
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                  attribution="© OpenStreetMap © CARTO"
                />

                <ZoomControl position="bottomright" />

                {sites.map((site) => (
                  <Marker key={site.id} position={[site.lat, site.lng]}>
                    <Tooltip direction="top" offset={[0, -8]} opacity={1}>
                      <div className="tip">
                        <strong>{site.name}</strong>
                        <div className="tip-row">
                          Assets: {site.assets} • Active: {site.active}
                        </div>
                      </div>
                    </Tooltip>
                  </Marker>
                ))}
              </MapContainer>
            </div>

            {/* KPI STRIP (like dashboard stats) */}
            <div className="kpi-strip">
              <div className="kpi-card">
                <div className="kpi-left">
                  <div className="kpi-icon">
                    <img src={ICONS.totalAssets} alt="total" />
                  </div>
                  <div>
                    <span>Total Assets</span>
                    <strong>{totals.totalAssets}</strong>
                  </div>
                </div>
              </div>

              <div className="kpi-card success">
                <div className="kpi-left">
                  <div className="kpi-icon">
                    <img src={ICONS.active} alt="active" />
                  </div>
                  <div>
                    <span>Active</span>
                    <strong>{totals.activeAssets}</strong>
                  </div>
                </div>
              </div>

              <div className="kpi-card danger">
                <div className="kpi-left">
                  <div className="kpi-icon">
                    <img src={ICONS.notReporting} alt="not reporting" />
                  </div>
                  <div>
                    <span>Not Reporting</span>
                    <strong>{totals.notReporting}</strong>
                  </div>
                </div>
              </div>

              <div className="kpi-card info">
                <div className="kpi-left">
                  <div className="kpi-icon">
                    <img src={ICONS.connections} alt="connections" />
                  </div>
                  <div>
                    <span>Connections</span>
                    <strong>{totals.connections}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT : ASSET TYPES */}
          <div className="asset-types-panel">
            <div className="right-head">
              <h4>Asset Types</h4>
              <span className="muted">Overview</span>
            </div>

            <div className="asset-types-list">
              {assetTypes.map((t) => (
                <div className="asset-type" key={t.id}>
                  <div className="asset-type-left">
                    <div className="type-ico">
                      <img src={t.icon} alt={t.name} />
                    </div>
                    <span>{t.name}</span>
                  </div>
                  <strong>{t.value}</strong>
                </div>
              ))}
            </div>

            {/* Optional CTA like dashboard */}
            <button className="cta-btn" type="button">
              View Asset Details →
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ClientHome;
