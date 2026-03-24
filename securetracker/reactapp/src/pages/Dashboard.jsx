import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { assetService } from "../services/assetService";
import Navbar from "../components/Auth/Layout/Navbar/Navbar";
import Sidebar from "../components/Auth/Layout/Sidebar/Sidebar";
import Footer from "../components/Auth/Layout/Footer";
import "./Dashboard.css";

/** ---------- Clean line SVG icons (industrial equipment) ---------- */
const AssetSvg = ({ name }) => {
  const common = { width: 34, height: 34, viewBox: "0 0 64 64", fill: "none" };

  switch (name) {
    case "roller":
      return (
        <svg {...common}>
          <path
            d="M10 34h28c6 0 10-4 10-10v-2H22c-6 0-12 4-12 12z"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M38 34h10c3 0 6 3 6 6v4H38v-10z"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <circle cx="18" cy="46" r="6" stroke="currentColor" strokeWidth="3" />
          <circle cx="46" cy="46" r="6" stroke="currentColor" strokeWidth="3" />
        </svg>
      );

    case "crane":
      return (
        <svg {...common}>
          <path
            d="M16 54V14l10 8v32"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M26 22h28l-8 8H26"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <path
            d="M46 30v10l-6 6"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M16 54h34"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      );

    case "loader":
      return (
        <svg {...common}>
          <path
            d="M14 40h18l6 8H14v-8z"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <path
            d="M32 32h10l6 8H32v-16z"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <path
            d="M48 40h8v8h-8"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle cx="22" cy="52" r="5" stroke="currentColor" strokeWidth="3" />
          <circle cx="44" cy="52" r="5" stroke="currentColor" strokeWidth="3" />
          <path
            d="M52 40l-6 12"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      );

    case "pump":
      return (
        <svg {...common}>
          <rect x="14" y="26" width="18" height="22" rx="4" stroke="currentColor" strokeWidth="3" />
          <path
            d="M32 30h10l6 6v12h-8"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <path
            d="M20 22v-6h14v6"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle cx="22" cy="52" r="5" stroke="currentColor" strokeWidth="3" />
          <circle cx="44" cy="52" r="5" stroke="currentColor" strokeWidth="3" />
        </svg>
      );

    case "plant":
      return (
        <svg {...common}>
          <path
            d="M18 50V22h10v28"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M28 26h12l6 8H28"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <path
            d="M18 50h30"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M22 22v-8h18v8"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      );

    default:
      return (
        <svg {...common}>
          <rect x="16" y="20" width="32" height="24" rx="6" stroke="currentColor" strokeWidth="3" />
          <path d="M22 44h20" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );
  }
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [assets, setAssets] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Filters like reference UI
  const [onlyCritical, setOnlyCritical] = useState(false);
  const [assetTypeFilter, setAssetTypeFilter] = useState("All");

  useEffect(() => {
    assetService.getAllAssets().then(setAssets).catch(console.error);
  }, []);

  // Type detection (supports different backend field names)
  const getType = (a) => a.asset_type || a.type || a.category || "Unknown";

  // KPIs
  const totalAssets = assets.length;

  const activeAssets = useMemo(
    () => assets.filter((a) => String(a.status || "").toLowerCase() === "active").length,
    [assets]
  );

  const maintenanceAssets = useMemo(
    () => assets.filter((a) => String(a.status || "").toLowerCase() === "maintenance").length,
    [assets]
  );

  const notReportingAssets = useMemo(
    () => assets.filter((a) => a.last_latitude == null || a.last_longitude == null).length,
    [assets]
  );

  // Types list for tiles
  const assetTypes = useMemo(() => {
    const counts = assets.reduce((acc, a) => {
      const t = String(getType(a));
      acc[t] = (acc[t] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts)
      .sort((x, y) => y[1] - x[1])
      .map(([name, count]) => ({ name, count }));
  }, [assets]);

  // Filtered assets
  const filteredAssets = useMemo(() => {
    return assets.filter((a) => {
      const typeOk = assetTypeFilter === "All" ? true : String(getType(a)) === assetTypeFilter;

      // "Only Critical" -> treat maintenance as critical (change if you have critical flag)
      const criticalOk = onlyCritical ? String(a.status || "").toLowerCase() === "maintenance" : true;

      return typeOk && criticalOk;
    });
  }, [assets, assetTypeFilter, onlyCritical]);

  // Right side panels
  const alerts = useMemo(() => {
    return filteredAssets
      .filter((a) => String(a.status || "").toLowerCase() === "maintenance")
      .slice(0, 6);
  }, [filteredAssets]);

  const watchlist = useMemo(() => {
    return filteredAssets
      .filter((a) => a.last_latitude == null || a.last_longitude == null)
      .slice(0, 4);
  }, [filteredAssets]);

  const recentAssets = useMemo(() => [...filteredAssets].slice(0, 6), [filteredAssets]);

  // ✅ Vehicle/equipment icon mapping (NO box icon)
  const getAssetTypeIcon = (typeName) => {
    const t = String(typeName || "").toLowerCase();

    // Simple vehicles via Bootstrap Icons
    if (t.includes("car")) return <i className="bi bi-car-front-fill" />;
    if (t.includes("truck")) return <i className="bi bi-truck-flatbed" />;
    if (t.includes("bus")) return <i className="bi bi-bus-front-fill" />;
    if (t.includes("bike") || t.includes("motor")) return <i className="bi bi-bicycle" />;

    // Industrial equipment via SVG
    if (t.includes("roller")) return <AssetSvg name="roller" />;
    if (t.includes("crane")) return <AssetSvg name="crane" />;
    if (t.includes("loader")) return <AssetSvg name="loader" />;
    if (t.includes("pump")) return <AssetSvg name="pump" />;
    if (t.includes("concrete") || t.includes("batching") || t.includes("plant"))
      return <AssetSvg name="plant" />;

    // fallback
    return <i className="bi bi-truck" />;
  };

  return (
    <div className="ai-layout ai-theme-light">
      <Navbar toggleSidebar={() => setSidebarOpen((p) => !p)} />
      <Sidebar isOpen={sidebarOpen} />

      {/* ✅ NO BIG GAP: ai-main has NO margin-top now */}
      <main className={`ai-main ${sidebarOpen ? "ai-sidebar-open" : "ai-sidebar-closed"}`}>
        {/* TOP BAR */}
        <section className="ai-topbar">
          <div className="ai-topbar__left">
            <div className="ai-brand">
              <div className="ai-brand__logo" aria-hidden="true">
                <i className="bi bi-geo-alt-fill" />
              </div>
              <div>
                <div className="ai-brand__title">Asset InSight</div>
                <div className="ai-brand__sub">Quick view by equipment category</div>
              </div>
            </div>

            <div className="ai-kpis">
              <div className="ai-kpi">
                <div className="ai-kpi__value">{totalAssets}</div>
                <div className="ai-kpi__label">Total assets</div>
              </div>
              <div className="ai-kpi">
                <div className="ai-kpi__value">{activeAssets}</div>
                <div className="ai-kpi__label">Active</div>
              </div>
              <div className="ai-kpi">
                <div className="ai-kpi__value">{maintenanceAssets}</div>
                <div className="ai-kpi__label">Asset issues</div>
              </div>
              <div className="ai-kpi">
                <div className="ai-kpi__value">{notReportingAssets}</div>
                <div className="ai-kpi__label">Not reporting</div>
              </div>
            </div>
          </div>

          <div className="ai-topbar__right">
            <div className="ai-actions">
              <button className="ai-iconbtn" title="Locations">
                <i className="bi bi-geo" />
              </button>
              <button className="ai-iconbtn" title="Alerts">
                <i className="bi bi-bell" />
              </button>
              <button className="ai-iconbtn" title="Analytics">
                <i className="bi bi-bar-chart" />
              </button>
              <button className="ai-iconbtn" title="Search">
                <i className="bi bi-search" />
              </button>

              <button className="ai-primarybtn" onClick={() => navigate("/assets")}>
                Manage Assets
              </button>
            </div>

            <div className="ai-filterRow">
              <label className="ai-check">
                <input
                  type="checkbox"
                  checked={onlyCritical}
                  onChange={(e) => setOnlyCritical(e.target.checked)}
                />
                <span>Only Critical</span>
              </label>

              <select
                className="ai-select"
                value={assetTypeFilter}
                onChange={(e) => setAssetTypeFilter(e.target.value)}
              >
                <option value="All">Showing All</option>
                {assetTypes.map((t) => (
                  <option key={t.name} value={t.name}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* MAIN GRID */}
        <section className="ai-grid">
          {/* LEFT */}
          <div className="ai-left">
            <div className="ai-card ai-section">
              <div className="ai-section__head">
                <div>
                  <div className="ai-h">Asset Types</div>
                  <div className="ai-muted">Quick view by equipment category</div>
                </div>

                <div className="ai-viewToggle">
                  <button className="ai-iconbtn ai-iconbtn--soft" title="Grid">
                    <i className="bi bi-grid-3x3-gap" />
                  </button>
                  <button className="ai-iconbtn ai-iconbtn--soft" title="Chart">
                    <i className="bi bi-graph-up" />
                  </button>
                </div>
              </div>

              <div className="ai-tileGrid">
                {(assetTypes.length ? assetTypes : [{ name: "Unknown", count: 0 }])
                  .slice(0, 10)
                  .map((t) => (
                    <button
                      key={t.name}
                      className={`ai-tile ${assetTypeFilter === t.name ? "ai-tile--active" : ""}`}
                      onClick={() => setAssetTypeFilter(t.name)}
                      type="button"
                    >
                      <div className="ai-tile__icon">
                        {/* ✅ vehicle/equipment icons */}
                        {getAssetTypeIcon(t.name)}
                      </div>

                      <div className="ai-tile__name">{String(t.name).toLowerCase()}</div>

                      <div className="ai-tile__count">
                        <span className="ai-tile__num">{t.count}</span>
                        <span className="ai-muted">assets</span>
                      </div>
                    </button>
                  ))}
              </div>
            </div>

            <div className="ai-card ai-section">
              <div className="ai-section__head">
                <div>
                  <div className="ai-h">My Assets</div>
                  <div className="ai-muted">Recent assets loaded</div>
                </div>
                <button className="ai-linkbtn" onClick={() => navigate("/assets")}>
                  View all <i className="bi bi-arrow-right" />
                </button>
              </div>

              {recentAssets.length ? (
                <div className="ai-list">
                  {recentAssets.map((a, idx) => (
                    <div key={a.id ?? a.asset_id ?? idx} className="ai-listRow">
                      <div className="ai-listRow__left">
                        <div className="ai-listRow__title">{a.name || a.asset_id || "Asset"}</div>
                        <div className="ai-muted ai-small">{a.status || "unknown"}</div>
                      </div>
                      <button className="ai-chip" onClick={() => navigate("/assets")}>
                        Open
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="ai-muted">No assets loaded yet.</div>
              )}
            </div>

            {/* Bottom strip */}
            <div className="ai-card ai-statusStrip">
              <div className="ai-statusItem">
                <i className="bi bi-slash-circle" />
                <div>
                  <div className="ai-statusVal">{notReportingAssets}</div>
                  <div className="ai-muted ai-small">Not reporting</div>
                </div>
              </div>

              <div className="ai-statusItem">
                <i className="bi bi-check2-circle" />
                <div>
                  <div className="ai-statusVal">{activeAssets}</div>
                  <div className="ai-muted ai-small">Active</div>
                </div>
              </div>

              <div className="ai-statusItem">
                <i className="bi bi-exclamation-triangle" />
                <div>
                  <div className="ai-statusVal">{maintenanceAssets}</div>
                  <div className="ai-muted ai-small">Issues</div>
                </div>
              </div>

              <button className="ai-addTile" onClick={() => navigate("/assets/onboarding")}>
                <i className="bi bi-plus-lg" />
                <span>Add Asset</span>
              </button>
            </div>
          </div>

          {/* RIGHT */}
          <aside className="ai-right">
            <div className="ai-card ai-panel">
              <div className="ai-panel__tabs">
                <button className="ai-tab ai-tab--active">
                  Alerts <span className="ai-pill">{alerts.length}</span>
                </button>
                <button className="ai-tab">
                  Notifications <span className="ai-pill">{Math.min(filteredAssets.length, 4)}</span>
                </button>
              </div>

              <div className="ai-panel__body">
                {alerts.length ? (
                  alerts.map((a, idx) => (
                    <div key={a.id ?? a.asset_id ?? idx} className="ai-alertRow">
                      <div className="ai-alertMain">
                        <div className="ai-alertTitle">{a.name || a.asset_id || "Asset"}</div>
                        <div className="ai-muted ai-small">
                          Status: <b>{a.status || "maintenance"}</b>
                        </div>
                      </div>
                      <div className="ai-alertBtns">
                        <button className="ai-iconbtn ai-iconbtn--soft" title="Open">
                          <i className="bi bi-box-arrow-up-right" />
                        </button>
                        <button className="ai-iconbtn ai-iconbtn--soft" title="Ack">
                          <i className="bi bi-check2" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="ai-muted">No alerts for current filter.</div>
                )}
              </div>
            </div>

            <div className="ai-card ai-panel">
              <div className="ai-panel__head">
                <div className="ai-h">Watchlist</div>
                <span className="ai-pill">{watchlist.length}</span>
              </div>

              <div className="ai-panel__body">
                {watchlist.length ? (
                  watchlist.map((a, idx) => (
                    <div key={a.id ?? a.asset_id ?? idx} className="ai-watchRow">
                      <div>
                        <div className="ai-watchTitle">{a.name || a.asset_id || "Asset"}</div>
                        <div className="ai-muted ai-small">Not reporting GPS</div>
                      </div>
                      <span className="ai-badge ai-badge--warn">Needs check</span>
                    </div>
                  ))
                ) : (
                  <div className="ai-muted">No watchlist items.</div>
                )}
              </div>

              <button className="ai-addBtn" onClick={() => navigate("/assets")}>
                <i className="bi bi-plus-lg" /> Add to Watchlist
              </button>
            </div>
          </aside>
        </section>

        <Footer />
      </main>
    </div>
  );
};

export default Dashboard;