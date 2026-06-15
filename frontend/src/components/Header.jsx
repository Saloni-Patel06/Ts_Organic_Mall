import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { apiFetch } from "../utils/apiFetch";
import getImage from "../utils/imagePath";
const Header = ({ cartQty }) => {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        apiFetch("/manage-products")
            .then(res => res.json())
            .then(data => setProducts(Array.isArray(data) ? data : []))
            .catch(() => { });
    }, []);
    const navigate = useNavigate();
    const location = useLocation();
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    const role = localStorage.getItem("role");
    const hidePublicNav = isLoggedIn;

    const showCart = !isLoggedIn || role === "customer";

    const logout = () => {
        localStorage.clear();
        navigate("/login");
    };
    const getDashboardTitle = () => {
        if (!isLoggedIn) return "";

        switch (role) {
            case "admin":
                return "Admin Panel";
            case "customer":
                return "Customer Panel ";
            case "agent":
                return "Delivery Agent Panel";
            default:
                return "";
        }
    };
    const isActive = (path) =>
        location.pathname === path ? "nav-link active" : "nav-link";
    const totalAmount = Object.entries(cartQty || {}).reduce(
        (sum, [key, qty]) => {
            const productId = key.split("_")[0];
            const product = products?.find(p => p.id === productId || p.id === Number(productId));
            return sum + (product ? product.price * qty : 0);
        },
        0
    );

    const cartCount = Object.values(cartQty || {}).reduce(
        (sum, qty) => sum + qty,
        0
    );
    const handleLogoClick = () => {
        if (!isLoggedIn) {
            navigate("/");
        } else if (role === "admin") {
            navigate("/admin-dashboard");
        } else if (role === "customer") {
            navigate("/customer-dashboard");
        } else if (role === "agent") {
            navigate("/delivery-dashboard");
        } else {
            navigate("/");
        }
    };

    return (
        <>
            <div className="fixed-top bg-white shadow-sm">

                <div className="top-bar row gx-0 align-items-center d-none d-lg-flex px-3">
                    <div className="col-lg-6 text-start">
                        <small>
                            <a
                                href="https://www.google.com/maps?q=Anand,Gujarat"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ textDecoration: "none", color: "inherit" }}
                            > <i className="fa fa-map-marker-alt me-2">
                                    Anand, Gujarat</i>
                            </a>
                        </small>

                        <small className="ms-4">
                            <a
                                href="mailto:tsorganicmall0623@gmail.com"
                                style={{ textDecoration: "none", color: "inherit" }}
                            >
                                <i className="fa fa-envelope">  tsorganicmall0623@gmail.com</i>
                            </a>
                        </small>
                    </div>

                    <div className="col-lg-6 text-end">
                        {isLoggedIn && (
                            <span
                                style={{
                                    fontWeight: "500",
                                    color: "#5c3b0c",
                                    fontSize: "20px"
                                }}
                            >
                                {getDashboardTitle()}
                            </span>
                        )}
                    </div>
                </div>

                {/* Navbar  */}
                <nav className="navbar navbar-expand-lg navbar-light py-lg-0 px-lg-2 shadow-sm">

                    {/* LOGO CLICKABLE FULL */}
                    <div
                        className="navbar-brand d-flex align-items-center"
                        style={{ cursor: "pointer" }}
                        onClick={handleLogoClick}
                    >


                        <img src={getImage("/img/logots.png")} alt="logo" style={{ height: 60 }} />
                        <h3
                            className="fw-bold m-0 ms-1"
                            style={{
                                color: "#3CB815",
                                textShadow: "1px 1px 2px rgba(126, 55, 10, 0.52)",
                                letterSpacing: "1px",
                                fontSize: "33px",
                            }}
                        >TS Organic Mall </h3>
                    </div>

                    <button
                        className="navbar-toggler"
                        data-bs-toggle="collapse"
                        data-bs-target="#navbarContent"
                    >
                        <span className="navbar-toggler-icon"></span>
                    </button>

                    <div className="collapse navbar-collapse" id="navbarContent">
                        <div className="navbar-nav ms-auto align-items-lg-center gap-lg-1 p-3 p-lg-0">

                            {!hidePublicNav && (
                                <>
                                    <Link to="/" className={isActive("/")}>Home</Link>
                                    <Link to="/about" className={isActive("/about")}>About Us</Link>
                                    <Link to="/products" className={isActive("/products")}>Products</Link>
                                    <Link to="/feature" className={isActive("/feature")}>Features</Link>
                                    <Link to="/contact" className={isActive("/contact")}>Contact</Link>
                                    <Link to="/team" className={isActive("/team")}>Team</Link>
                                </>
                            )}

                            {isLoggedIn && role === "admin" && (
                                <>
                                    <Link to="/agent" className={isActive("/agent")}>Agent</Link>
                                    <Link to="/agent-wallet" className={isActive("/agent-wallet")}>Agent Wallet</Link>
                                    <Link to="/users" className={isActive("/users")}>Customer</Link>
                                    <Link to="/ManageProducts" className={isActive("/ManageProducts")}>Products</Link>
                                    <Link to="/view-orders" className={isActive("/view-orders")}>Orders</Link>
                                    <Link to="/Payment" className={isActive("/Payment")}>Payment</Link>
                                    <Link to="/view-contact" className={isActive("/view-contact")}>Contacts</Link>
                                    <Link to="/view-support" className={isActive("/view-support")}>Help</Link>
                                    <Link to="/Report" className={isActive("/Report")}>Report</Link>
                                </>
                            )}

                            {isLoggedIn && role === "customer" && (
                                <>
                                    <Link to="/products" className={isActive("/products")}>Products</Link>
                                    <Link to="/orders" className={isActive("/orders")}>My Orders</Link>
                                    <Link to="/support" className={isActive("/support")}>Help</Link>
                                </>
                            )}

                            {isLoggedIn && role === "agent" && (
                                <>
                                    <Link to="/delivery/assigned-orders" className={isActive("/delivery/assigned-orders")}>Assigned Orders</Link>
                                    <Link to="/delivery/earnings" className={isActive("/delivery/earnings")}>Earnings</Link>
                                    <Link to="/delivery/Order-Completed" className={isActive("/delivery/order-completed")}>Order Completed</Link>
                                </>
                            )}

                            {showCart && (
                                <button
                                    onClick={() => navigate("/cart")}
                                    style={{
                                        background: "#3CB815",
                                        color: "#fff",
                                        border: "none",
                                        borderRadius: "12px",
                                        padding: "5px 10px",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "8px",
                                        fontWeight: "600",
                                        boxShadow: "0 2px 6px rgba(0,0,0,0.2)"
                                    }}
                                >
                                    <i className="fa fa-shopping-cart"></i>

                                    <div style={{ textAlign: "left", lineHeight: "1.1" }}>
                                        <div style={{ fontSize: "14px" }}>
                                            {cartCount} items
                                        </div>
                                        <div style={{ fontSize: "14px" }}>
                                            ₹{totalAmount}
                                        </div>
                                    </div>
                                </button>
                            )}
                            {isLoggedIn && (role === "customer" || role === "agent") && (
                                <div className="nav-item dropdown ms-3" style={{ position: "relative" }}>
                                    <button
                                        onClick={() => setDropdownOpen(!dropdownOpen)}
                                        style={{
                                            fontSize: "18px",
                                            padding: "10px 20px",
                                            borderRadius: "20px",
                                            color: "#5e4212",
                                            background: "#f8f9fa",
                                            border: "1px solid #5e4212",
                                            fontWeight: "500",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "8px"
                                        }}
                                    >
                                        <i className="fa fa-user-circle"></i>
                                        Profile
                                        <i className="fa fa-chevron-down" style={{ fontSize: "12px" }}></i>
                                    </button>

                                    {dropdownOpen && (
                                        <ul
                                            className="dropdown-menu show"
                                            style={{
                                                position: "absolute",
                                                top: "110%",
                                                right: 0,
                                                width: "160px",
                                                borderRadius: "12px",
                                                overflow: "hidden",
                                                boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
                                            }}
                                        >
                                            <li>
                                                <Link
                                                    to={role === "customer" ? "/profile" : "/delivery/agent-profile"}
                                                    className="dropdown-item"
                                                    onClick={() => setDropdownOpen(false)}
                                                >
                                                    <i className="fa fa-user me-2"></i>
                                                    Edit Profile
                                                </Link>
                                            </li>

                                            <li>
                                                <button
                                                    onClick={logout}
                                                    className="dropdown-item text-danger"
                                                    style={{
                                                        background: "transparent",
                                                        border: "none",
                                                        width: "100%",
                                                        textAlign: "left"
                                                    }}
                                                >
                                                    <i className="fa fa-sign-out-alt me-2"></i>
                                                    Logout
                                                </button>
                                            </li>
                                        </ul>
                                    )}
                                </div>
                            )}

                            {isLoggedIn && role === "admin" && (
                                <button
                                    onClick={logout}
                                    style={{
                                        fontSize: "16px",
                                        padding: "10px 16px",
                                        borderRadius: "20px",
                                        background: "#dc3545",
                                        color: "#fff",
                                        border: "none",
                                        fontWeight: "500"
                                    }}
                                >
                                    Logout
                                </button>
                            )}
                        </div>

                        {!isLoggedIn && (
                            <Link
                                to="/login"
                                className={`btn btn-light ms-3 ${isActive("/login")}`}
                                style={{
                                    fontSize: "18px",
                                    padding: "10px 20px",
                                    borderRadius: "20px"
                                }}
                            >
                                Login
                            </Link>
                        )}
                    </div>
                </nav>

                <style>{`
        .nav-link{position:relative;font-weight:500;}
        .nav-link::after{content:"";position:absolute;width:0%;height:2px;left:0;bottom:0;background:#2e7d32;transition:0.3s;}
        .nav-link:hover::after{width:100%;}
        .nav-link.active::after{width:100%;}
        .nav-link.active{color:#2e7d32!important;font-weight:600;}
        .dropdown-menu.show{display:block; position:absolute; background:#fff; min-width:150px; box-shadow:0 2px 8px rgba(0,0,0,0.15);}
      `}</style>
            </div>
        </>
    );
};

export default Header;