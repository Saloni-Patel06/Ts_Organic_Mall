import React, { useState, useEffect } from "react";
import { apiFetch } from "../utils/apiFetch";
import { useNavigate } from "react-router-dom";

const VerifyOtp = () => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const storedEmail = localStorage.getItem("tempEmail");
    if (storedEmail) {
      setEmail(storedEmail);
    } else {
      setError("No registration found. Please register first.");
      navigate("/register");
    }
  }, [navigate]);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await apiFetch("/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("OTP Verified Successfully!");
        localStorage.removeItem("tempEmail");
        localStorage.removeItem("userId");
        setTimeout(() => navigate("/login"), 1500);
      } else {
        setError(data.message || "Invalid OTP");
      }
    } catch (err) {
      setError("Something went wrong!");
    }

    setLoading(false);
  };

  return (
    <div className="container-fluid page-header position-relative min-vh-100 d-flex align-items-center justify-content-center overflow-hidden">

      {/* Background Blur Overlay */}
      <div
        className="position-absolute top-0 start-0 w-100 h-100"
        style={{
          backdropFilter: "blur(2px)",
          background: "rgba(250, 242, 242, 0.2)",
          zIndex: 1,
        }}
      ></div>

      {/* Card */}
      <div className="col-md-4 col-lg-3 position-relative" style={{ zIndex: 2 }}>
        <div
          className="card shadow"
          style={{
            background: "rgba(255,255,255,0.15)",
            backdropFilter: "blur(9px)",
            borderRadius: "14px",
            border: "1px solid rgba(255,255,255,0.25)",
            boxShadow: "0 8px 32px rgba(133, 26, 26, 0.1)"
          }}
        >
          <div className="card-body p-4">
            <h4 className="text-center mb-2"><b>VERIFY OTP</b></h4>

            <p className="text-center small text-muted mb-3">
              Sent to: <b>{email || "Loading..."}</b>
            </p>

            {message && (
              <div className="text-success text-center mb-2 small">
                {message}
              </div>
            )}

            {error && (
              <div className="text-danger text-center mb-2 small">
                {error}
              </div>
            )}

            <form onSubmit={handleVerify}>
              <div className="mb-3">
                <input
                  type="text"
                  className="form-control text-center"
                  placeholder="Enter 4-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={4}
                  required
                  style={{ letterSpacing: "6px", fontSize: "18px" }}
                />
              </div>

              <button
                type="submit"
                className="btn w-100"
                disabled={loading || !email}
                style={{
                  backgroundColor: "#3CB815",
                  color: "#fff",
                  fontWeight: "500"
                }}
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>
            </form>

            <div className="text-center mt-3 small">
              <span>Wrong email? </span>
              <span
                style={{ color: "#F65005", cursor: "pointer" }}
                onClick={() => navigate("/register")}
              >
                Register Again
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;