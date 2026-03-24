import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LandingPage.css";

export default function LandingPage() {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);

 const heroImages = [
  "https://images.unsplash.com/photo-1548345680-f5475ea5df84?w=1200&auto=format&fit=crop&q=70",
  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop&q=70",
  "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&auto=format&fit=crop&q=70",
];


  useEffect(() => {
    const id = setInterval(() => {
      setActiveIndex((i) => (i + 1) % heroImages.length);
    }, 2500);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="lp-root">
      {/* ===== NAVBAR ===== */}
      <header className="lp-navbar">
        <div className="lp-container">
          <h4 className="lp-logo">
            Secure<span>Tracker</span>
          </h4>

          {/* ✅ Added: navbar actions */}
          <div className="lp-nav-actions">
            <button className="lp-btn-outline" onClick={() => navigate("/login")}>
              Login
            </button>
            <button className="lp-btn-primary" onClick={() => navigate("/signup")}>
              Sign Up
            </button>
          </div>
        </div>
      </header>

      {/* ===== HERO ===== */}
      <section className="lp-hero">
        <div className="lp-container lp-hero-grid">
          <div className="lp-hero-text">
            <h1>
              Secure asset tracking
              <br />
              <span>built for real‑time visibility</span>
            </h1>

            <p className="lp-subtext">
              Track assets live, visualize movement, and protect access with built‑in MFA security.
            </p>

            <div className="lp-cta-row">
              <button className="lp-btn-primary" onClick={() => navigate("/signup")}>
                Get Started
              </button>
            </div>

            <p className="lp-meta">
              Live tracking · Real‑time alerts · Secure platform
            </p>

            {/* ✅ Added: trust chips (matches Secure Tracker security direction: MFA/JWT/org access) */}
            <div className="lp-chips">
              <span className="lp-chip">🔐 MFA Enabled</span>
              <span className="lp-chip">🏢 Org-based Access</span>
            </div>

            {/* ✅ Added: KPI-style quick highlights */}
            <div className="lp-stats">
              <div className="lp-stat">
                <div className="lp-stat-value">Live</div>
                <div className="lp-stat-label">Telemetry updates</div>
              </div>
              <div className="lp-stat">
                <div className="lp-stat-value">GPS</div>
                <div className="lp-stat-label">Location & movement</div>
              </div>
              <div className="lp-stat">
  <div className="lp-stat-value">Real‑time</div>
  <div className="lp-stat-label">Location updates</div>
</div>
            </div>
          </div>

         <div className="lp-hero-visual">
  <img
    src={heroImages[activeIndex]}
    alt="Hero preview"
  />
</div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="lp-features">
        <div className="lp-container">
          <h2 className="lp-section-title">Core capabilities</h2>
          <p className="lp-section-sub">
            Designed for secure, real‑time asset operations.
          </p>

          <div className="lp-feature-grid">
            {[
              ["📍", "Live Asset Tracking", "Monitor GPS location and movement in real time."],
              ["🧭", "Route & History", "View last known location and movement context on maps."],
              ["📊", "Operational Insights", "View speed, distance, and movement analytics."],
              ["⚡", "Real‑time Updates", "Event‑driven live telemetry updates."],
            ].map(([icon, title, desc]) => (
              <div className="lp-feature-card" key={title}>
                <div className="lp-feature-icon">{icon}</div>
                <h6>{title}</h6>
                <p>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== MAP PREVIEW ===== */}
      <section className="lp-map">
        <div className="lp-container lp-map-grid">
          <div>
            <h2>
              Visualize movement
              <br />
              <span>on interactive maps</span>
            </h2>
            <p>
              Track routes, monitor last known location, and manage multiple assets with clarity.
            </p>

            <div className="lp-cta-row">
              <button className="lp-btn-primary" onClick={() => navigate("/login")}>
                Open Dashboard
              </button>
            </div>
          </div>

         <div className="lp-map-preview">
  <img
    src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=1400&auto=format&fit=crop&q=70"
    alt="Map preview"
  />
</div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="lp-footer">
        <div className="lp-container">
          <span>© {new Date().getFullYear()} Secure Tracker</span>
          <span>Built for secure asset operations</span>
        </div>
      </footer>
    </div>
  );
}
 