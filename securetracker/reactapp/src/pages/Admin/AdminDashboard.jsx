import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";
import CustomerOnboarding from "./CustomerOnboarding";

const API_BASE =
  process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000/api/v1";

/* ============================= */
/* INDUSTRY SVG ICONS (inline)   */
/* ============================= */
const Icon = ({ name, className = "", title }) => {
  const common = {
    className: `ui-ico ${className}`,
    "aria-hidden": title ? undefined : true,
    role: title ? "img" : "presentation",
    viewBox: "0 0 24 24",
  };

  switch (name) {
    case "users":
      return (
        <svg {...common}>
          {title ? <title>{title}</title> : null}
          <path
            d="M16 11c1.66 0 3-1.57 3-3.5S17.66 4 16 4s-3 1.57-3 3.5S14.34 11 16 11ZM8 11c1.66 0 3-1.57 3-3.5S9.66 4 8 4 5 5.57 5 7.5 6.34 11 8 11Z"
            fill="currentColor"
            opacity="0.12"
          />
          <path
            d="M16 11c1.66 0 3-1.57 3-3.5S17.66 4 16 4s-3 1.57-3 3.5S14.34 11 16 11ZM8 11c1.66 0 3-1.57 3-3.5S9.66 4 8 4 5 5.57 5 7.5 6.34 11 8 11Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <path
            d="M3.5 20c.4-3.2 3.2-5.2 6.5-5.2S16.1 16.8 16.5 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M14.8 14.9c.5-.1 1-.1 1.5-.1 3.2 0 5.4 1.8 5.7 5.2"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      );

    case "building":
      return (
        <svg {...common}>
          {title ? <title>{title}</title> : null}
          <path
            d="M6 21V5a2 2 0 012-2h8a2 2 0 012 2v16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M9 7h2M9 10h2M9 13h2M13 7h2M13 10h2M13 13h2"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M10 21v-4a2 2 0 012-2 2 2 0 012 2v4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      );

    case "truck":
      return (
        <svg {...common}>
          {title ? <title>{title}</title> : null}
          <path
            d="M3.5 16V7.5A2.5 2.5 0 016 5h8.5A2.5 2.5 0 0117 7.5V16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M17 10h3l1.5 2.5V16H17"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path
            d="M7 18.5a1.5 1.5 0 103 0 1.5 1.5 0 00-3 0ZM17.5 18.5a1.5 1.5 0 103 0 1.5 1.5 0 00-3 0Z"
            fill="currentColor"
            opacity="0.12"
          />
          <path
            d="M7 18.5a1.5 1.5 0 103 0 1.5 1.5 0 00-3 0ZM17.5 18.5a1.5 1.5 0 103 0 1.5 1.5 0 00-3 0Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <path
            d="M3.5 16h4M13 16h4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      );

    case "antenna":
      return (
        <svg {...common}>
          {title ? <title>{title}</title> : null}
          <path
            d="M12 20v-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M9.5 20h5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M12 14a2 2 0 100-4 2 2 0 000 4Z"
            fill="currentColor"
            opacity="0.12"
          />
          <path
            d="M12 14a2 2 0 100-4 2 2 0 000 4Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <path
            d="M7.8 9.8a6 6 0 018.4 0M5.8 7.8a8.8 8.8 0 0112.4 0"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      );

    case "search":
      return (
        <svg {...common}>
          {title ? <title>{title}</title> : null}
          <path
            d="M10.5 18a7.5 7.5 0 110-15 7.5 7.5 0 010 15Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <path
            d="M16.5 16.5 21 21"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      );

    case "refresh":
      return (
        <svg {...common}>
          {title ? <title>{title}</title> : null}
          <path
            d="M20 12a8 8 0 10-2.34 5.66"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M20 12v-4h-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );

    case "tag":
      return (
        <svg {...common}>
          {title ? <title>{title}</title> : null}
          <path
            d="M20 13l-7 7-10-10V4h6l11 9Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path
            d="M7.5 7.5h.01"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      );

    case "doc":
      return (
        <svg {...common}>
          {title ? <title>{title}</title> : null}
          <path
            d="M7 3h7l3 3v15a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path
            d="M14 3v4a2 2 0 002 2h4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path
            d="M8 12h8M8 16h8"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      );

    case "plus":
      return (
        <svg {...common}>
          {title ? <title>{title}</title> : null}
          <path
            d="M12 5v14M5 12h14"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      );

    case "warning":
      return (
        <svg {...common}>
          {title ? <title>{title}</title> : null}
          <path
            d="M12 3 1.8 20.2A1.5 1.5 0 003.1 22h17.8a1.5 1.5 0 001.3-2.3L12 3Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path
            d="M12 9v5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M12 17h.01"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      );

    case "arrowRight":
      return (
        <svg {...common}>
          {title ? <title>{title}</title> : null}
          <path
            d="M5 12h12"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M13 6l6 6-6 6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );

    case "close":
      return (
        <svg {...common}>
          {title ? <title>{title}</title> : null}
          <path
            d="M6 6l12 12M18 6 6 18"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      );

    case "empty":
      return (
        <svg {...common}>
          {title ? <title>{title}</title> : null}
          <path
            d="M12 22c5.52 0 10-4.48 10-10S17.52 2 12 2 2 6.48 2 12s4.48 10 10 10Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <path
            d="M8.5 10.5h.01M15.5 10.5h.01"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M8.5 16c1.2-1 2.4-1.5 3.5-1.5S14.3 15 15.5 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      );

    default:
      return null;
  }
};

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

      // Map into UI-friendly structure (do NOT force mock numbers)
      const mapped = (Array.isArray(data) ? data : [])
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
      totalSites: clients.reduce((s, c) => s + (c.sites || 0), 0),
      totalAssets: clients.reduce((s, c) => s + (c.assets || 0), 0),
      totalConnections: clients.reduce((s, c) => s + (c.connections || 0), 0),
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