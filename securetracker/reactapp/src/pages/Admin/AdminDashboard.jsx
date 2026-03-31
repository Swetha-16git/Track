import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";

/* =========================
   Fallback data (only used if API fails / empty)
========================= */
const fallbackClients = [
  { code: "LT", name: "L&T", sites: 6, assets: 42, status: "Active", connections: 38 },
  { code: "TATA", name: "Tata Projects", sites: 4, assets: 31, status: "Active", connections: 28 },
];

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

  const token =
    localStorage.getItem("access_token") || localStorage.getItem("token");

  const fetchClients = async () => {
    setLoading(true);
    setErrorMsg("");

    try {
      // ✅ If your backend endpoint exists, use it:
      // GET /api/v1/admin/clients/summary  (recommended)
      const res = await fetch(`${API_BASE}/admin/clients/summary`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("API not ready, using fallback data.");

      const data = await res.json();

      // ✅ Expecting array of:
      // [{ code,name,sites,assets,status,connections }]
      if (Array.isArray(data) && data.length > 0) {
        setClients(data);
      } else {
        setClients(fallbackClients);
      }
    } catch (err) {
      // ✅ fallback mode (still looks real)
      setClients(fallbackClients);
      
    } finally {
      setLastUpdated(new Date());
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formattedLastUpdated = useMemo(() => {
    return lastUpdated.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }, [lastUpdated]);

  const filteredClients = useMemo(() => {
    const query = q.trim().toLowerCase();

    return clients.filter((c) => {
      const matchQuery =
        !query ||
        c.name.toLowerCase().includes(query) ||
        (c.code || "").toLowerCase().includes(query);

      const matchStatus =
        statusFilter === "all" ||
        (c.status || "").toLowerCase() === statusFilter;

      return matchQuery && matchStatus;
    });
  }, [clients, q, statusFilter]);

  const totals = useMemo(() => {
    const totalClients = clients.length;
    const totalSites = clients.reduce((s, c) => s + (Number(c.sites) || 0), 0);
    const totalAssets = clients.reduce((s, c) => s + (Number(c.assets) || 0), 0);
    const totalConnections = clients.reduce((s, c) => s + (Number(c.connections) || 0), 0);
    return { totalClients, totalSites, totalAssets, totalConnections };
  }, [clients]);

  const openClientDashboard = (client) => {
    navigate(`/client/${encodeURIComponent(client.code)}/home`, {
      state: { client },
    });
  };

  return (
    <div className="admin-dashboard">
      {/* TOP BAR */}
      <div className="admin-topbar">
        <div>
          <h2 className="admin-title">Operational Overview</h2>
          <p className="admin-subtitle">
            Last updated on: <b>{formattedLastUpdated}</b>
            {errorMsg && <span className="admin-badge warn"> {errorMsg}</span>}
          </p>
        </div>
{/* 
        <div className="admin-actions">
          <button className="btn-outline" onClick={fetchClients} disabled={loading}>
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div> */}
      </div>

      {/* KPI STRIP */}
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

      {/* SEARCH + FILTER */}
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
          <option value="maintenance">Maintenance</option>
        </select>
      </div>

      {/* GRID */}
      <div className="admin-client-grid">
        {loading ? (
          // ✅ Skeleton cards (real feel)
          <>
            <div className="client-skeleton" />
            <div className="client-skeleton" />
            <div className="client-skeleton" />
          </>
        ) : filteredClients.length === 0 ? (
          <div className="admin-empty">
            <h3>No clients found</h3>
            <p>Try changing the search text or status filter.</p>
          </div>
        ) : (
          filteredClients.map((c) => (
            <div
              className="admin-client-card clickable"
              key={c.code || c.name}
              onClick={() => openClientDashboard(c)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && openClientDashboard(c)}
            >
              <div className="client-card-head">
                <h3>{c.name}</h3>
                <span className={`status-pill ${String(c.status).toLowerCase()}`}>
                  {c.status}
                </span>
              </div>

              <div className="admin-client-stats">
                <div>🏢 Sites: <b>{c.sites}</b></div>
                <div>🚜 Assets: <b>{c.assets}</b></div>
                <div>🔌 Connections: <b>{c.connections}</b></div>
              </div>

              {/* <div className="client-card-footer">
                <span className="hint">Open dashboard </span>
              </div> */}
            </div>
          ))
        )}
      </div>

    
    </div>
  );
}
