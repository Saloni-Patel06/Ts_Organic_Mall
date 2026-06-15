import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../utils/apiFetch";

const Login = ({ setRole }) => {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // 👈 add
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();

  const validate = () => {
    let newErrors = {};
    if (!email.trim()) newErrors.email = "Email is required";
    if (!password.trim()) newErrors.password = "Password is required";
    return newErrors;
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const response = await apiFetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("role", data.user.role);
        localStorage.setItem("email", data.user.email);
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        localStorage.setItem("userId", data.user._id);
        localStorage.setItem("name", data.user.name || "");
        localStorage.setItem("mobile", data.user.mobile || "");
        localStorage.setItem("address", data.user.address || "");
        localStorage.setItem("pincode", data.user.pincode || "");
        localStorage.setItem("city", data.user.city || "");

        if (setRole) setRole(data.user.role);

        if (data.user.role === "admin") navigate("/admin-dashboard", { replace: true });
        else if (data.user.role === "customer") navigate("/customer-dashboard", { replace: true });
        else if (data.user.role === "agent") navigate("/delivery-dashboard", { replace: true });
      }
        setErrors({ password: "Invalid password" });

    } catch (error) {
    console.error("Login error:", error);
    setErrors({ password: "Invalid password" });
  }
  };

  return (
    <div className="container-fluid page-header position-relative min-vh-100 d-flex align-items-center justify-content-center overflow-hidden">
      <br /><br />

      <div
        className="position-absolute top-0 start-0 w-100 h-100"
        style={{
          backdropFilter: "blur(2px)",
          background: "rgba(250, 242, 242, 0.2)",
          zIndex: 1,
        }}
      ></div>

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
            <h4 className="text-center mb-3"><b>LOGIN</b></h4>

            {errors.general && (
              <div className="text-danger text-center mb-2 small">
                {errors.general}
              </div>
            )}

            <form onSubmit={handleLogin}>

              <div className="mb-3">
                <input
                  type="email"
                  className={`form-control ${errors.email ? "is-invalid" : ""}`}
                  placeholder="Email ID"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrors((prev) => ({ ...prev, email: "" }));
                  }}
                />
                {errors.email && (
                  <div className="text-danger small mt-1">{errors.email}</div>
                )}
              </div>

              <div className="mb-3 position-relative">
                <input
                  type={showPassword ? "text" : "password"}   // 👈 change
                  className={`form-control ${errors.password ? "is-invalid" : ""}`}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrors((prev) => ({ ...prev, password: "" }));
                  }}
                />

                {/* 👁 show / hide button */}
                <span
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    cursor: "pointer",
                    fontSize: "14px"
                  }}
                >
                  {showPassword ? "🙈" : "👁"}
                </span>

                {errors.password && (
                  <div className="text-danger small mt-1">{errors.password}</div>
                )}
              </div>

              <button type="submit" className="btn btn-primary w-100">
                Login
              </button>

            </form>

            <div className="text-center mt-3 small">
              <span>New user? </span>
              <span
                style={{ color: "#0d6efd", cursor: "pointer" }}
                onClick={() => navigate("/register")}
              >
                Register
              </span>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;