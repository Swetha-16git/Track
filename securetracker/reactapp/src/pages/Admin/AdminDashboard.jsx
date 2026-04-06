import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";
import CustomerOnboarding from "./CustomerOnboarding";

const API_BASE =
  process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000/api/v1";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [errorMsg, setErrorMsg] = useState("");
  const [showOnboard, setShowOnboard] = useState(false);

  const token =
    localStorage.getItem("access_token") || localStorage.getItem("token");

  // ✅ Demo rule: every client has 3 sites (matches ClientHome map)
  // Later replace this with real API count per client.
  const getSitesCountForClient = () => 3;

  const fetchClients = async () => {
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch(`${API_BASE}/admin/clients/summary`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("API not ready");

      const data = await res.json();

      const mapped = data
        .filter((c) => c.status === "ACTIVE")
        .map((c) => ({
          code: c.client_code,
          name: c.client_name,
          status: c.status,
          sites: getSitesCountForClient(c.client_code),
          assets: 0,
          connections: 0,
        }));

      setClients(mapped);
    } catch {
      setErrorMsg("Using fallback data");
      setClients([]);
    } finally {
      setLastUpdated(new Date());
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formattedLastUpdated = useMemo(
    () =>
      lastUpdated.toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      }),
    [lastUpdated]
  );

  const filteredClients = useMemo(() => {
    const query = q.trim().toLowerCase();
    return clients.filter(
      (c) =>
        (!query ||
          c.name.toLowerCase().includes(query) ||
          c.code.toLowerCase().includes(query)) &&
        (statusFilter === "all" || c.status.toLowerCase() === statusFilter)
    );
  }, [clients, q, statusFilter]);

  const totals = useMemo(
    () => ({
      totalClients: clients.length,
      totalSites: clients.reduce((s, c) => s + c.sites, 0),
      totalAssets: clients.reduce((s, c) => s + c.assets, 0),
      totalConnections: clients.reduce((s, c) => s + c.connections, 0),
    }),
    [clients]
  );

  const openClientDashboard = (client) => {
    navigate(`/client/${encodeURIComponent(client.code)}/home`, {
      state: { client },
    });
  };

  return (
    // ✅ OUTER WRAPPER: full width, no padding/margin (prevents right-gap layout)
    <div
      className="admin-dashboard"
      style={{
        width: "100%",
        margin: 0,
        padding: 0,
      }}
    >
      {/* ✅ INNER WRAPPER: keep your design spacing here */}
      <div
        className="admin-dashboard-inner"
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "20px",
        }}
      >
        {/* HEADER */}
        <div className="admin-topbar">
          <div>
            <h2 className="admin-title">Operational Overview</h2>
            <p className="admin-subtitle">
              Last updated on <b>{formattedLastUpdated}</b>
              {errorMsg && <span className="admin-badge warn"> {errorMsg}</span>}
            </p>
          </div>

          <div className="admin-actions">
            <button className="add-client-btn" onClick={() => setShowOnboard(true)}>
              <span className="add-icon">+</span>
              Add Client
            </button>
          </div>
        </div>

        {/* KPI */}
        <div className="admin-kpis">
          <div className="kpi">
            <div className="kpi-label">Clients</div>
            <div className="kpi-value">{totals.totalClients}</div>
          </div>
          <div className="kpi">
            <div className="kpi-label">Sites</div>
            <div className="kpi-value">{totals.totalSites}</div>
          </div>
          <div className="kpi">
            <div className="kpi-label">Assets</div>
            <div className="kpi-value">{totals.totalAssets}</div>
          </div>
          <div className="kpi">
            <div className="kpi-label">Connections</div>
            <div className="kpi-value">{totals.totalConnections}</div>
          </div>
        </div>

        {/* FILTERS */}
        <div className="admin-filters">
          <input
            className="admin-search"
            placeholder="Search client (name or code)..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />

          <select
            className="admin-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* CLIENT GRID */}
        <div className="admin-client-grid">
          {loading ? (
            <div style={{ padding: 12, color: "#64748b" }}>Loading...</div>
          ) : filteredClients.length === 0 ? (
            <div style={{ padding: 12, color: "#64748b" }}>No clients found</div>
          ) : (
            filteredClients.map((c) => (
              <div
                className="admin-client-card clickable"
                key={c.code}
                onClick={() => openClientDashboard(c)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && openClientDashboard(c)}
              >
                <div className="client-card-head">
                  <h3>{c.name}</h3>
                  <span className={`status-pill ${c.status.toLowerCase()}`}>
                    {c.status}
                  </span>
                </div>

                <div className="admin-client-stats">
                  <div>🏢 Sites: <b>{c.sites}</b></div>
                  <div>🚜 Assets: <b>{c.assets}</b></div>
                  <div>📡 Connections: <b>{c.connections}</b></div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* MODAL */}
        {showOnboard && (
          <div className="modal-overlay">
            <div className="modal-card">
              <CustomerOnboarding />
              <div className="modal-actions">
                <button
                  className="btn-secondary"
                  onClick={() => {
                    setShowOnboard(false);
                    fetchClients();
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}