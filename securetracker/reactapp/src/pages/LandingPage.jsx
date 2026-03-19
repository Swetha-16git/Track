import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";


/* ===== Images per tab ===== */
const TAB_IMAGES = {
  tracking:
    "https://images.unsplash.com/photo-1548345680-f5475ea5df84?w=1200&auto=format&fit=crop&q=70",
  analytics:
    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop&q=70",
  security:
    "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&auto=format&fit=crop&q=70",
};

/* ✅ Map images */
const MAP_IMAGES = [
  "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=1400&auto=format&fit=crop&q=70",
  "https://images.unsplash.com/photo-1502920514313-52581002a659?w=1400&auto=format&fit=crop&q=70",
  "https://images.unsplash.com/photo-1481537788063-bc8855ddbe46?w=1400&auto=format&fit=crop&q=70",
];

export default function LandingPage() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("tracking");

  /* ✅ Auto-switch tabs every 3s */
  useEffect(() => {
    const order = ["tracking", "analytics", "security"];
    const id = setInterval(() => {
      setActiveTab((prev) => {
        const idx = order.indexOf(prev);
        return order[(idx + 1) % order.length];
      });
    }, 2000);
    return () => clearInterval(id);
  }, []);

  /* ✅ Vertical scroll map slider state */
  const [mapBase, setMapBase] = useState(0); // base index for the set
  const [mapSliding, setMapSliding] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      setMapSliding(true);
    }, 1000); // change every 3.5s
    return () => clearInterval(id);
  }, []);

  // after animation completes, commit next base and stop sliding
  useEffect(() => {
    if (!mapSliding) return;
    const t = setTimeout(() => {
      setMapBase((b) => (b + 1) % MAP_IMAGES.length);
      setMapSliding(false);
    }, 780); // slightly > 750ms animation
    return () => clearTimeout(t);
  }, [mapSliding]);

  const tabLabel = useMemo(() => {
    const t = activeTab.charAt(0).toUpperCase() + activeTab.slice(1);
    return t;
  }, [activeTab]);

  // indices for map slider
  const len = MAP_IMAGES.length;
  const i0 = mapBase % len;
  const i1 = (mapBase + 1) % len;
  const i2 = (mapBase + 2) % len;
  const i3 = (mapBase + 3) % len;

  return (
    <div className="min-vh-100">
      {/* ===== Fonts + Custom Styles ===== */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Poppins:wght@600;700&display=swap');

        :root{
          /* ✅ Thick Blue */
          --b1:#004B86;
          --b2:#003A6B;
          --b3:#0A66C2;

          --ink:#0b1b35;
          --muted: rgba(10,20,40,.68);

          --bg:#f6f8fc;
          --card: rgba(255,255,255,.78);
          --card2: rgba(255,255,255,.92);
          --border: rgba(12, 18, 28, 0.10);
          --shadow: 0 18px 60px rgba(18, 38, 63, 0.12);

          /* ✅ Core capabilities panel colors (lighter + suits black cards) */
          --dk-bg: #1c222b;
          --dk-bg2: #1a2330;
          --dk-card: linear-gradient(180deg, #161f2b, #111823);
          --dk-border: rgba(255,255,255,0.12);
          --dk-text: rgba(255,255,255,0.92);
          --dk-muted: rgba(255,255,255,0.68);
        }

        body{ font-family: Inter, system-ui, -apple-system, Segoe UI, sans-serif; background: var(--bg); }
        h1,h2,h3{ font-family: Poppins, Inter, sans-serif; }
        .text-muted2{ color: var(--muted); }

        /* ===== Background: premium light ===== */
        .bg-premium{
          background:
            radial-gradient(900px 600px at 10% 10%, rgba(0,75,134,.18), transparent 60%),
            radial-gradient(800px 520px at 95% 20%, rgba(10,102,194,.16), transparent 55%),
            radial-gradient(900px 700px at 60% 95%, rgba(0,58,107,.10), transparent 60%),
            linear-gradient(180deg, #f6f8fc 0%, #ffffff 45%, #ffffff 100%);
        }

        /* ===== Glass card ===== */
        .glass{
          background: var(--card);
          border: 1px solid var(--border);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-radius: 22px;
          box-shadow: var(--shadow);
        }

        /* ===== Navbar ===== */
        .nav-glass{
          background: rgba(255,255,255,0.78);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(12,18,28,0.08);
        }

        /* ===== Buttons ===== */
        .btn-primary-thick{
          background: linear-gradient(180deg, var(--b1) 0%, var(--b2) 100%);
          color: #fff;
          border: none;
          padding: 12px 28px;
          border-radius: 14px;
          font-weight: 700;
          box-shadow: 0 16px 40px rgba(0,75,134,.25);
          transition: transform .2s ease, box-shadow .2s ease, filter .2s ease;
        }
        .btn-primary-thick:hover{
          transform: translateY(-1px);
          box-shadow: 0 22px 55px rgba(0,75,134,.32);
          filter: saturate(1.05);
        }

        .btn-outline-thick{
          background: rgba(0,75,134,0.06);
          color: var(--b1);
          border: 1px solid rgba(0,75,134,0.22);
          padding: 10px 18px;
          border-radius: 12px;
          font-weight: 700;
          transition: all .2s ease;
        }
        .btn-outline-thick:hover{
          background: rgba(0,75,134,0.10);
          border-color: rgba(0,75,134,0.32);
        }

        /* ===== Tabs ===== */
        .tab-pill{
          padding: 10px 18px;
          border-radius: 999px;
          background: rgba(255,255,255,0.75);
          border: 1px solid rgba(12,18,28,0.10);
          color: rgba(11,27,53,.74);
          font-weight: 700;
          transition: all .22s ease;
        }
        .tab-pill:hover{ transform: translateY(-1px); border-color: rgba(0,75,134,0.20); }
        .tab-pill.active{
          background: linear-gradient(180deg, rgba(0,75,134,1) 0%, rgba(0,58,107,1) 100%);
          color:#fff;
          border-color: rgba(0,75,134,0.35);
          box-shadow: 0 14px 32px rgba(0,75,134,.22);
        }

        /* ===== Frames ===== */
        .img-frame{
          border-radius: 18px;
          overflow: hidden;
          border: 1px solid rgba(12,18,28,0.10);
          box-shadow: 0 18px 50px rgba(18,38,63,0.14);
        }

        /* ===== Feature cards ===== */
        .feature{
          background: var(--card2);
          border: 1px solid rgba(12,18,28,0.10);
          border-radius: 18px;
          padding: 22px;
          box-shadow: 0 12px 35px rgba(18,38,63,0.08);
          transition: transform .22s ease, box-shadow .22s ease, border-color .22s ease;
        }
        .feature:hover{
          transform: translateY(-6px);
          box-shadow: 0 22px 55px rgba(18,38,63,0.12);
          border-color: rgba(0,75,134,0.18);
        }

        /* ✅ Core capabilities - make it a shaped panel (NOT full width) */
        .cap-wrapper{
          padding: 64px 48px;
          border-radius: 28px;
          background:
            radial-gradient(900px 600px at 15% 10%, rgba(34, 105, 158, 0.18), transparent 60%),
            radial-gradient(700px 500px at 85% 25%, rgba(10,102,194,.12), transparent 55%),
            linear-gradient(180deg, var(--dk-bg2) 0%, var(--dk-bg) 100%);
          box-shadow: 0 40px 120px rgba(177, 168, 168, 0.3);
          color: var(--dk-text);
        }
        @media (max-width: 768px){
          .cap-wrapper{ padding: 48px 22px; border-radius: 22px; }
        }
        .cap-title{ color:#fff; }
        .cap-sub{ color: var(--dk-muted); }

        .feature-dark{
          background: var(--dk-card);
          border: 1px solid var(--dk-border);
          box-shadow: 0 18px 50px rgba(0,0,0,0.35);
        }
        .feature-dark:hover{
          transform: translateY(-6px);
          box-shadow: 0 26px 70px rgba(0,0,0,0.45);
          border-color: rgba(0,75,134,0.35);
        }
        .feature-dark h6{ color: #fff; }
        .feature-dark p{ color: var(--dk-muted); }

        .cap-underline{
          height: 3px;
          width: 64px;
          border-radius: 999px;
          background: linear-gradient(90deg, var(--b1), var(--b3));
          opacity: 0.95;
        }

        /* ===== Accent line ===== */
        .accent-line{
          height: 4px;
          width: 220px;
          border-radius: 999px;
          background: linear-gradient(90deg, var(--b1), var(--b3), var(--b2));
          background-size: 200% 100%;
          animation: slide 3.2s ease-in-out infinite;
          opacity: .95;
        }
        @keyframes slide{
          0%{ background-position: 0% 50%; }
          50%{ background-position: 100% 50%; }
          100%{ background-position: 0% 50%; }
        }

        /* ===== Map section ===== */
        .map-section{
          background: #ffffff;
          border-top: 1px solid rgba(12,18,28,0.06);
        }
        .map-card{
          background: rgba(255,255,255,0.92);
          border: 1px solid rgba(12,18,28,0.10);
          border-radius: 20px;
          box-shadow: 0 18px 60px rgba(18,38,63,0.10);
          overflow: hidden;
        }
        .map-chip{
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          border-radius: 999px;
          background: rgba(0,75,134,0.08);
          border: 1px solid rgba(0,75,134,0.16);
          color: var(--b1);
          font-weight: 700;
          font-size: 0.9rem;
        }

        /* ✅ Vertical scrolling slider (the effect you asked) */
        .vslide{
          position: relative;
          overflow: hidden;
          border-radius: 18px;
        }
        .vslide img{
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          filter: contrast(1.04) saturate(1.08);
        }

        .slide-out-up{ animation: slideOutUp 750ms cubic-bezier(.2,.9,.2,1) forwards; }
        .slide-in-up{  animation: slideInUp  750ms cubic-bezier(.2,.9,.2,1) forwards; }

        @keyframes slideOutUp{
          from{ transform: translateY(0%); }
          to{ transform: translateY(-110%); }
        }
        @keyframes slideInUp{
          from{ transform: translateY(110%); }
          to{ transform: translateY(0%); }
        }

        /* ===== Footer Colors ===== */
        .footer-colored{
          background: linear-gradient(
            180deg,
            rgba(0,75,134,0.10) 0%,
            rgba(18,24,33,0.06) 100%
          );
          border-top: 1px solid rgba(0,75,134,0.20);
        }
        .footer-title{
          color: var(--ink);
          font-weight: 800;
        }
        .footer-muted{
          color: rgba(10,20,40,0.62);
        }
        .footer-link,
        .footer-link.btn,
        .footer-link.btn-link{
          color: rgba(10,20,40,0.68) !important;
          text-decoration: none !important;
          background: transparent !important;
          border: none !important;
          transition: color .2s ease;
          padding: 0 !important;
        }
        .footer-link:hover,
        .footer-link.btn:hover,
        .footer-link.btn-link:hover{
          color: var(--b1) !important;
        }
      `}</style>

      {/* ===== NAVBAR ===== */}
      <nav className="navbar position-sticky top-0 nav-glass" style={{ zIndex: 1000 }}>
        <div className="container py-2 d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-2">
            <span className="fw-bold" style={{ fontSize: 18, color: "var(--ink)" }}>
              Secure<span style={{ color: "var(--b1)" }}>Tracker</span>
            </span>
          </div>

          <div className="d-flex gap-2">
            <button className="btn-outline-thick" onClick={() => navigate("/signup")}>
              Sign Up
            </button>
            <button className="btn-outline-thick" onClick={() => navigate("/login")}>
              Login
            </button>
          </div>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <section className="bg-premium py-5">
        <div className="container py-4">
          <div className="row align-items-center g-5">
            {/* LEFT */}
            <div className="col-lg-6">
              <span
                className="badge mb-3"
                style={{
                  background: "rgba(0,75,134,0.10)",
                  color: "var(--b1)",
                  border: "1px solid rgba(0,75,134,0.18)",
                  padding: "10px 14px",
                  borderRadius: "999px",
                  fontWeight: 800,
                }}
              >
                Asset tracking project
              </span>

              <h1 className="display-5 fw-bold" style={{ color: "var(--ink)" }}>
                Secure asset tracking
                <br />
                <span style={{ color: "var(--b1)" }}>with controlled access</span>
              </h1>

              <div className="mt-3 accent-line" />

              <p className="mt-3 text-muted2" style={{ fontSize: "1.05rem", maxWidth: 520 }}>
                Monitor vehicles, manage assets, and control permissions using role‑based access and
                MFA authentication.
              </p>

              <div className="d-flex gap-3 flex-wrap mt-4">
                <button className="btn-primary-thick" onClick={() => navigate("/login")}>
                  Go to Login
                </button>

                <button className="btn-outline-thick" onClick={() => navigate("/login")}>
                  Get Started
                </button>
              </div>

              <p className="small mt-3" style={{ color: "rgba(10,20,40,0.55)" }}>
                Admin · Viewer · MFA · Live tracking
              </p>
            </div>

            {/* RIGHT */}
            <div className="col-lg-6">
              <div className="glass p-3 p-md-4">
                {/* TABS */}
                <div className="d-flex flex-wrap gap-3 mb-3">
                  {["tracking", "analytics", "security"].map((tab) => (
                    <button
                      key={tab}
                      className={`tab-pill ${activeTab === tab ? "active" : ""}`}
                      onClick={() => setActiveTab(tab)}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>

                {/* IMAGE */}
                <div className="ratio ratio-4x3 img-frame">
                  <img
                    src={TAB_IMAGES[activeTab]}
                    alt={activeTab}
                    className="img-fluid w-100 h-100"
                    style={{ objectFit: "cover", filter: "contrast(1.04) saturate(1.08)" }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ✅ ===== CORE CAPABILITIES (SHAPED PANEL) ===== */}
      <section className="py-5">
        <div className="container">
          <div className="cap-wrapper">
            <h2 className="fw-bold text-center mb-2 cap-title">Core capabilities</h2>
            <p className="text-center mb-4 cap-sub">
              Everything you need for secure asset operations.
            </p>

            <div className="row g-4">
              {[
                ["📍", "Live Tracking", "View real‑time GPS location of assets."],
                ["📦", "Asset Management", "Add, update, and manage vehicles."],
                ["🛡️", "Access Control", "Admin & Viewer permissions enforced."],
                ["🔐", "MFA Security", "OTP‑based multi‑factor authentication."],
              ].map(([icon, title, text]) => (
                <div className="col-md-6 col-lg-3" key={title}>
                  <div className="feature feature-dark h-100">
                    <div className="fs-3 mb-2">{icon}</div>
                    <h6 className="mb-2" style={{ fontWeight: 800 }}>
                      {title}
                    </h6>
                    <p className="small mb-0">{text}</p>
                    <div className="mt-3 cap-underline" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ✅ ===== MAP SECTION (VERTICAL SCROLL TRANSITION) ===== */}
      <section className="py-5 map-section">
        <div className="container">
          <div className="row align-items-center g-5">
            {/* LEFT */}
            <div className="col-lg-5">
              <span
                className="badge mb-3"
                style={{
                  background: "rgba(248, 249, 250, 0.1)",
                  color: "var(--b1)",
                  border: "1px solid rgba(0,75,134,0.18)",
                  padding: "10px 14px",
                  borderRadius: "999px",
                  fontWeight: 800,
                }}
              >
                Live Map Preview
              </span>

              <h2 className="fw-bold" style={{ color: "var(--ink)" }}>
                Visualize asset movement
                <br />
                <span style={{ color: "var(--b1)" }}>on an interactive map</span>
              </h2>

              <p className="text-muted2 mt-3" style={{ maxWidth: 520 }}>
                Track routes, view last known location, and monitor multiple assets with clear map‑based
                visibility.
              </p>

              <div className="d-flex flex-wrap gap-2 mt-3">
                <span className="map-chip">🟦 Live updates</span>
                <span className="map-chip">📌 Geofencing</span>
                <span className="map-chip">🧭 Route history</span>
              </div>

              <div className="mt-4 d-flex gap-3 flex-wrap">
                <button className="btn-primary-thick" onClick={() => navigate("/login")}>
                  Open Dashboard
                </button>
                <button className="btn-outline-thick" onClick={() => navigate("/login")}>
                  View Assets
                </button>
              </div>
            </div>

            {/* RIGHT */}
            <div className="col-lg-7">
              <div className="map-card p-3 p-md-4">
                <div className="row g-3">
                  {/* Big map */}
                  <div className="col-12">
                    <div className="ratio ratio-21x9 img-frame vslide">
                      <img
                        src={MAP_IMAGES[i0]}
                        alt="map-main"
                        className={mapSliding ? "slide-out-up" : ""}
                      />
                      {mapSliding && (
                        <img
                          src={MAP_IMAGES[i1]}
                          alt="map-main-next"
                          className="slide-in-up"
                        />
                      )}
                    </div>
                  </div>

                  {/* Small map 1 */}
                  <div className="col-md-6">
                    <div className="ratio ratio-4x3 img-frame vslide">
                      <img
                        src={MAP_IMAGES[i1]}
                        alt="map-2"
                        className={mapSliding ? "slide-out-up" : ""}
                      />
                      {mapSliding && (
                        <img
                          src={MAP_IMAGES[i2]}
                          alt="map-2-next"
                          className="slide-in-up"
                        />
                      )}
                    </div>
                  </div>

                  {/* Small map 2 */}
                  <div className="col-md-6">
                    <div className="ratio ratio-4x3 img-frame vslide">
                      <img
                        src={MAP_IMAGES[i2]}
                        alt="map-3"
                        className={mapSliding ? "slide-out-up" : ""}
                      />
                      {mapSliding && (
                        <img
                          src={MAP_IMAGES[i3]}
                          alt="map-3-next"
                          className="slide-in-up"
                        />
                      )}
                    </div>
                  </div>
                </div>

                <div className="small mt-3" style={{ color: "rgba(10,20,40,0.55)" }}>
                  Map visuals are for UI preview — your real GPS data will render here.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ✅ ===== FOOTER (COLORED) ===== */}
      <footer className="footer-colored">
        <div className="container py-5">
          <div className="row g-4">
            {/* Brand */}
            <div className="col-md-4">
              <h5 className="footer-title">
                Secure<span style={{ color: "var(--b1)" }}>Tracker</span>
              </h5>
              <p className="small footer-muted mt-2" style={{ maxWidth: 280 }}>
                Secure asset tracking with role‑based access and multi‑factor authentication.
              </p>
            </div>

            {/* Quick Links */}
            <div className="col-md-2">
              <h6 className="footer-title mb-3">Quick Links</h6>
              <ul className="list-unstyled small">
                <li className="mb-2">
                  <button className="btn btn-link footer-link" onClick={() => navigate("/login")}>
                    Login
                  </button>
                </li>
                <li className="mb-2">
                  <button className="btn btn-link footer-link" onClick={() => navigate("/signup")}>
                    Sign Up
                  </button>
                </li>
                <li className="mb-2">
                  <button className="btn btn-link footer-link" onClick={() => navigate("/login")}>
                    Dashboard
                  </button>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div className="col-md-3">
              <h6 className="footer-title mb-3">Support</h6>
              <ul className="list-unstyled small footer-muted">
                <li className="mb-2">Help Center</li>
                <li className="mb-2">FAQs</li>
                <li className="mb-2">Privacy Policy</li>
                <li className="mb-2">Terms &amp; Conditions</li>
              </ul>
            </div>

            {/* Contact */}
            <div className="col-md-3">
              <h6 className="footer-title mb-3">Contact Us</h6>
              <ul className="list-unstyled small footer-muted">
                <li className="mb-2">📧 support@securetracker.com</li>
                <li className="mb-2">📞 +91 9XXXXXXXXX</li>
                <li className="mb-2">📍 Chennai, India</li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div
            className="d-flex flex-column flex-md-row justify-content-between align-items-center pt-4 mt-4"
            style={{ borderTop: "1px solid rgba(0,75,134,0.20)" }}
          >
            <span className="small footer-muted">
              © {new Date().getFullYear()} Secure Tracker. All rights reserved.
            </span>

            <span className="small footer-muted mt-2 mt-md-0">
              Built for secure asset operations
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}