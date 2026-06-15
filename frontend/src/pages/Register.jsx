import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch } from "../utils/apiFetch";   

const Register = () => {
  const [role, setRole] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
    password: "",
    city: "Anand",
    address: "",
    pincode: "",
    vehicleNumber: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      role,
      name: formData.name,
      email: formData.email,
      password: formData.password,
      mobile: formData.mobile,
      pincode: formData.pincode,
    };

    if (role === "customer") {
      payload.city = formData.city;
      payload.address = formData.address;
    }

    if (role === "agent") {
      payload.vehicleNumber = formData.vehicleNumber;
    }

    try {
      const response = await apiFetch("/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        // Store temp data for verify
        localStorage.setItem("tempUserId", result.userId);
        localStorage.setItem("tempEmail", formData.email);
        localStorage.setItem("tempName", formData.name);
        localStorage.setItem("tempRole", role);
        localStorage.setItem("tempMobile", formData.mobile);

        alert("Registration successful! Check your email for OTP.");
        navigate("/verify-otp");
      } else {
        alert(result.message || "Registration Failed");
      }
    } catch (error) {
      alert("Server Error: " + error.message);
    }

    setLoading(false);
  };

  return (
    <div className="container-fluid page-header position-relative min-vh-100 d-flex align-items-center justify-content-center overflow-hidden">
      <div className="position-absolute top-0 start-0 w-100 h-100"
        style={{ backdropFilter: "blur(2px)", background: "rgba(250, 242, 242, 0.2)", zIndex: 1 }}></div>

      <div className="col-md-5 col-lg-4 position-relative" style={{ zIndex: 2 }}>
        <div className="card shadow" style={{
          background: "rgba(255,255,255,0.15)",
          backdropFilter: "blur(9px)",
          borderRadius: "14px",
          border: "1px solid rgba(255,255,255,0.25)",
        }}>
          <div className="card-body p-4">
            <h4 className="text-center mb-3">Create Account</h4>

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Select Role</label>
                <select
                  className="form-select"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  required
                  disabled={loading}
                >
                  <option value="">-- Choose Role --</option>
                  <option value="customer">Customer</option>
                  <option value="agent">Delivery Agent</option>
                </select>
              </div>

              {role && (
                <>
                  <div className="mb-2">
                    <input
                      type="text"
                      name="name"
                      className="form-control"
                      placeholder="Full Name *"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="mb-2">
                    <input
                      type="email"
                      name="email"
                      className="form-control"
                      placeholder="Email *"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="mb-2">
                    <input
                      type="password"
                      name="password"
                      className="form-control"
                      placeholder="Password *"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="mb-2">
                    <input
                      type="tel"
                      name="mobile"
                      className="form-control"
                      placeholder="Mobile Number *"
                      maxLength="10"
                      pattern="[0-9]{10}"
                      value={formData.mobile}
                      onChange={handleChange}
                      required
                      disabled={loading}
                    />
                  </div>

                  {role === "customer" && (
                    <>
                      <div className="mb-2">
                        <input
                          type="text"
                          name="city"
                          className="form-control"
                          placeholder="City *"
                          value={formData.city}
                          onChange={handleChange}
                          required
                          disabled={loading}
                        />
                      </div>
                      <div className="mb-2">
                        <textarea
                          name="address"
                          className="form-control"
                          rows="2"
                          placeholder="Address *"
                          value={formData.address}
                          onChange={handleChange}
                          required
                          disabled={loading}
                        ></textarea>
                      </div>
                    </>
                  )}

                  <div className="mb-3">
                    <input
                      type="text"
                      name="pincode"
                      className="form-control"
                      placeholder="Pincode *"
                      maxLength="6"
                      pattern="[0-9]{6}"
                      value={formData.pincode}
                      onChange={handleChange}
                      required
                      disabled={loading}
                    />
                  </div>

                  {role === "agent" && (
                    <div className="mb-3">
                      <input
                        type="text"
                        name="vehicleNumber"
                        className="form-control"
                        placeholder="Vehicle Number (e.g., GJ01AB1234) *"
                        value={formData.vehicleNumber}
                        onChange={handleChange}
                        required
                        disabled={loading}
                      />
                    </div>
                  )}
                </>
              )}

              {role && (
                <button type="submit" className="btn btn-primary w-100 mt-2" disabled={loading}>
                  {loading ? "Registering..." : "Register & Send OTP"}
                </button>
              )}
            </form>

            <div className="text-center mt-3 small">
              <span>Already registered? </span>
              <Link to="/login" className="text-primary">Login here</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
