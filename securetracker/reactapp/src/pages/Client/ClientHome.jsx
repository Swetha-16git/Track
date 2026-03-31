import React, { useMemo } from "react";

const ClientHome = () => {
  // UI-only dummy data (later replace with API)
  const sites = useMemo(
    () => [
      {
        id: 1,
        name: "L&T Chennai Yard",
        assets: 18,
        activeAssets: 16,
        status: "Active",
        updated: "2 mins ago",
      },
      {
        id: 2,
        name: "L&T Bangalore Site",
        assets: 12,
        activeAssets: 10,
        status: "Active",
        updated: "5 mins ago",
      },
      {
        id: 3,
        name: "L&T Hyderabad Plant",
        assets: 12,
        activeAssets: 12,
        status: "Active",
        updated: "Just now",
      },
    ],
    []
  );

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
      {/* ===== HEADER ===== */}
      <div className="client-home-header">
        <h2>Client Home</h2>
        <div className="client-home-sub">
          Live overview of sites, assets and reports
        </div>
      </div>

      {/* ===== KPI CARDS ===== */}
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

      {/* ===== SITE SUMMARY ===== */}
      <div className="panel">
        <div className="panel-head">
          <div className="panel-title">Site Summary</div>
          <div className="panel-sub">Quick view of all sites</div>
        </div>

        <div className="site-list">
          {sites.map((s) => (
            <div key={s.id} className="site-row">
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

      {/* ===== ALERTS ===== */}
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
              <div className="alert-sub">
                L&T Bangalore Site • 10 mins ago
              </div>
            </div>
          </div>

          <div className="alert-item">
            <span className="alert-dot info" />
            <div>
              <div className="alert-title">New asset onboarded</div>
              <div className="alert-sub">
                L&T Chennai Yard • 1 hour ago
              </div>
            </div>
          </div>

          <div className="alert-item">
            <span className="alert-dot ok" />
            <div>
              <div className="alert-title">Gateway online</div>
              <div className="alert-sub">
                L&T Hyderabad Plant • 2 hours ago
              </div>
            </div>
          </div>
        </div>

        <button className="btn-secondary">View All Alerts</button>
      </div>

      {/* ===== REPORTS ===== */}
      <div className="reports-section">
        <div className="reports-head">
          <h3>Reports</h3>
          <div className="reports-sub">
            Generate and download operational reports
          </div>
        </div>

        <div className="report-grid">
          <div className="report-card">
            <div className="report-title">Asset Movement</div>
            <div className="report-desc">
              Track movement history across sites
            </div>
            <button className="btn-primary">Open</button>
          </div>

          <div className="report-card">
            <div className="report-title">Utilization</div>
            <div className="report-desc">
              Working vs idle time analysis
            </div>
            <button className="btn-primary">Open</button>
          </div>

          <div className="report-card">
            <div className="report-title">Idle Time</div>
            <div className="report-desc">
              Identify underutilized assets
            </div>
            <button className="btn-primary">Open</button>
          </div>

          <div className="report-card">
            <div className="report-title">Download Reports</div>
            <div className="report-desc">
              Export PDF / Excel (UI only)
            </div>
            <button className="btn-primary">Download</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientHome;