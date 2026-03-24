import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { assetService } from "../services/assetService";
import Navbar from "../components/Auth/Layout/Navbar/Navbar";
import Sidebar from "../components/Auth/Layout/Sidebar/Sidebar";
import Footer from "../components/Auth/Layout/Footer";
import "./Dashboard.css";

const normalizeType = (t) =>
  String(t || "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

const typeToIconFile = (type) => {
  const t = normalizeType(type);

  if (t.includes("concrete_plant") || t === "plant") return "concrete plant.png";
  if (t.includes("tower_crane") || t.includes("towercrane")) return "towercrane.png";
  if (t.includes("road_roller") || t.includes("roller")) return "road roller.png";
  if (t.includes("wheel_loader") || t.includes("loader")) return "wheelloader.png";
  if (t.includes("concrete_pump") || t.includes("pump")) return "concrete pump.png";

  if (t.includes("backhoe")) return "backhoe loader.png";
  if (t.includes("bulldozer")) return "bulldozer.png";
  if (t.includes("compactor")) return "compactor.png";
  if (t.includes("grader")) return "grader.png";
  if (t.includes("paver")) return "paver.jpg";

  if (t.includes("crawlercrane")) return "crawlercrane.png";
  if (t.includes("mobilecrane")) return "mobilecrane.png";

  if (t.includes("dumptruck") || t.includes("dump")) return "dumptruck.png";
  if (t.includes("forklift")) return "forklift.png";
  if (t.includes("excavator")) return "excavator.jpg";
  if (t.includes("telehandler")) return "telehandler.jpg";

  return "compactor.png";
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [assets, setAssets] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // ✅ Keep only useful filters
  const [onlyCritical, setOnlyCritical] = useState(false);
  const [assetTypeFilter, setAssetTypeFilter] = useState("All");

  useEffect(() => {
    assetService.getAllAssets().then(setAssets).catch(console.error);
  }, []);

  const getType = (a) => a.asset_type || a.type || a.category || "Unknown";

  // KPIs
  const totalAssets = assets.length;

  const activeAssets = useMemo(
    () => assets.filter((a) => String(a.status || "").toLowerCase() === "active").length,
    [assets]
  );

  const maintenanceAssets = useMemo(
    () =>
      assets.filter((a) => String(a.status || "").toLowerCase() === "maintenance").length,
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
      const typeOk =
        assetTypeFilter === "All" ? true : String(getType(a)) === assetTypeFilter;

      // Only Critical -> maintenance treated as critical
      const criticalOk = onlyCritical
        ? String(a.status || "").toLowerCase() === "maintenance"
        : true;

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

  const getAssetTypeIcon = (typeName) => {
    const filename = typeToIconFile(typeName);
    return (
      <img
        src={`/vehicle-icons/${filename}`}
        alt=""
        className="tile-icon-img"
        onError={(e) => {
          e.currentTarget.src = "/vehicle-icons/compactor.png";
        }}
        style={{ width: "34px", height: "34px", objectFit: "contain" }}
      />
    );
  };

  return (
    <div className="ai-layout ai-theme-light">
      <Navbar toggleSidebar={() => setSidebarOpen((p) => !p)} />
      <Sidebar isOpen={sidebarOpen} />

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

          {/* ✅ Removed extra top-right icons: locations/alerts/analytics/search */}
          <div className="ai-topbar__right">
            <div className="ai-actions">
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

                {/* ✅ Removed grid/chart view toggle buttons */}
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
                      <div className="ai-tile__icon">{getAssetTypeIcon(t.name)}</div>

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