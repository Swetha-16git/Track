import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import OtpTimer from "./OtpTimer";
import "./MFA.css";
import assetImg from "../../../assets/loader.png";
import { useAuth } from "../../../context/AuthContext";

const MFA = () => {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const navigate = useNavigate();
  const { refreshAuth } = useAuth();

  const API_BASE = useMemo(() => {
    return process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000/api/v1";
  }, []);

  const getTempToken = () => localStorage.getItem("temp_token");

  const safeJson = async (res) => {
    try {
      return await res.json();
    } catch {
      return null;
    }
  };

  // ✅ Decode role from JWT safely (works even before AuthContext refresh)
  const getRoleFromJwt = (jwt) => {
    try {
      if (!jwt) return null;
      const payload = jwt.split(".")[1];
      const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
      const json = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      const obj = JSON.parse(json);

      // common keys (depends on backend)
      return (
        obj.role ||
        obj.user_role ||
        obj.userRole ||
        obj.roles?.[0] ||
        obj["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
        null
      );
    } catch {
      return null;
    }
  };

  // ✅ Send Email OTP
  const handleSendOtp = async () => {
    setError("");

    const tempToken = getTempToken();
    if (!tempToken) {
      setError("Session expired. Please login again.");
      navigate("/login", { replace: true });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/mfa/email/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ temp_token: tempToken }),
      });

      const data = await safeJson(res);

      if (!res.ok) {
        const msg = data?.detail || data?.message || "Failed to send OTP";
        if (String(msg).toLowerCase().includes("expired")) {
          localStorage.removeItem("temp_token");
          localStorage.setItem("mfa_verified", "false");
          throw new Error("MFA session expired. Please login again.");
        }
        throw new Error(msg);
      }

      setOtpSent(true);
    } catch (err) {
      setError(err?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Verify OTP
  const handleVerify = async () => {
    setError("");

    if (otp.length !== 6) {
      setError("Please enter a valid 6‑digit OTP");
      return;
    }

    const tempToken = getTempToken();
    if (!tempToken) {
      setError("Session expired. Please login again.");
      navigate("/login", { replace: true });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/verify-mfa`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          temp_token: tempToken,
          code: otp,
          method: "email",
        }),
      });

      const data = await safeJson(res);

      if (!res.ok) {
        throw new Error(data?.detail || data?.message || "OTP verification failed");
      }

      // ✅ Store tokens
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("token", data.access_token);

      if (data.refresh_token) {
        localStorage.setItem("refresh_token", data.refresh_token);
      }

      // ✅ IMPORTANT: mark MFA complete & clear temp token
      localStorage.setItem("mfa_verified", "true"); // MUST be "true"
      localStorage.removeItem("temp_token");

      // ✅ clean any older keys (your screenshot showed inconsistent token key names)
      localStorage.removeItem("assets_token");
      localStorage.removeItem("pending_access_token");

      // ✅ Refresh auth context (role/permissions)
      window.dispatchEvent(new Event("auth-refresh"));
      refreshAuth?.();

      // ✅ Redirect ADMIN to /admin/dashboard, others to /dashboard
      const role = getRoleFromJwt(data.access_token);
      if (String(role).toLowerCase() === "admin") {
        navigate("/admin/dashboard", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      const msg = err?.message || "";

      if (
        msg.toLowerCase().includes("mfa") ||
        msg.toLowerCase().includes("verification") ||
        msg.toLowerCase().includes("otp")
      ) {
        setError("Incorrect or expired OTP. Please try again.");
      } else {
        setError(msg || "OTP verification failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("temp_token");
    localStorage.removeItem("pending_access_token");
    localStorage.removeItem("assets_token");
    localStorage.removeItem("user");
    localStorage.setItem("mfa_verified", "false");

    window.dispatchEvent(new Event("auth-refresh"));
    refreshAuth?.();
    navigate("/login", { replace: true });
  };

  return (
    <div className="st-page">
      <div className="st-shell st-shell--mfa">
        {/* LEFT PANEL */}
        <div className="st-left">
          <div className="st-brand">
            <span className="st-dot" />
            <div>
              <h1 className="st-app">SecureTracker</h1>
              <p className="st-app-sub">
                Secure verification required to protect your account
              </p>
            </div>
          </div>

          <img src={assetImg} alt="SecureTracker" className="st-asset-img" />

          <div className="st-chips">
            <span className="st-chip">Identity protected</span>
            <span className="st-chip">Email verification</span>
            <span className="st-chip">Enterprise security</span>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="st-right">
          <div className="mfa-panel">
            <div className="mfa-header">
              <h1>Verify your identity</h1>
              <p>
                For security reasons, we require an additional verification step.
                A one‑time password will be sent to your registered email address.
              </p>
            </div>

            <div className="mfa-content">
              {!otpSent ? (
                <>
                  <button
                    className="mfa-action-btn"
                    onClick={handleSendOtp}
                    disabled={loading}
                    type="button"
                  >
                    {loading ? "Sending OTP…" : "Send verification code"}
                  </button>
                </>
              ) : (
                <>
                  <p className="mfa-description">
                    Enter the 6‑digit code sent to your email
                  </p>

                  <OtpTimer onResend={handleSendOtp} />

                  <div className="form-group">
                    <label htmlFor="email-otp">Verification code</label>
                    <input
                      type="text"
                      id="email-otp"
                      value={otp}
                      onChange={(e) =>
                        setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                      }
                      placeholder="123456"
                      maxLength={6}
                      required
                      disabled={loading}
                    />
                  </div>

                  <button
                    className="mfa-action-btn"
                    type="button"
                    onClick={handleVerify}
                    disabled={loading || otp.length !== 6}
                  >
                    {loading ? "Verifying…" : "Verify and continue"}
                  </button>
                </>
              )}
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="mfa-footer">
              <button className="back-btn" onClick={handleBackToLogin} type="button">
                Cancel sign‑in
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MFA;