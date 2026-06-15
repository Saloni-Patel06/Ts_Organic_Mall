import { Link, useLocation } from "react-router-dom";
// import { FaEnvelope } from "react-icons/fa";

function Footer() {
  const role = localStorage.getItem("role");
  const location = useLocation();
  const path = location.pathname.toLowerCase();

  const isAdminRoute = path.includes("/admin");
  const isAgentRoute = path.includes("/delivery");
  const isCustomerRoute = path.includes("/customer");

  const showFullFooter =
    !role ||
    role === "guest" ||
    role === "customer" ||
    isCustomerRoute;

  const showOnlyLine =
    role === "admin" ||
    role === "agent" ||
    isAdminRoute ||
    isAgentRoute;

  return (
    <div>

      {showFullFooter && (
        <div className="container-fluid bg-dark footer pt-2 pb-2">

          <div className="container py-4">
            <div className="row g-3">

              <div className="col-lg-3 col-md-6">
                <h2
                  className="mb-3 py-1"
                  style={{
                    color: "#3CB815",
                    textShadow: "1px 1px 2px rgba(255, 255, 255, 0.76)",
                    letterSpacing: "-1px"

                  }}
                >TS Organic Mall
                </h2>

                <p style={{ lineHeight: "1.6" }}>
                  From nature's land to your hand,<br /> organic goodness as we planned,<br />
                  Pure and fresh in every bite, <br />quality assured with trust so tight.
                </p>



                <div className="d-flex pt-1">
                  <small>Connect with us:</small>
                  <a className="text-body ms-2" href="https://www.instagram.com/ts_organic_mall/?hl=en"><i className="fab fa-instagram"></i></a>
                </div>
              </div>

              <div className="col-lg-3 col-md-6">
                <h3 className="text-light mb-3 py-1">Address</h3>

                {/* Address → Opens Google Maps */}
                <p style={{ fontSize: "0.85rem" }}>
                  <i className="fa fa-map-marker-alt me-2"></i>
                  <a
                    href="https://www.google.com/maps?q=Anand,Gujarat"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    Anand, Gujarat
                  </a>
                </p>

                {/* Mobile → Direct Call */}
                <p style={{ fontSize: "0.85rem" }}>
                  <i className="fa fa-phone-alt me-2"></i>
                  <a
                    href="tel:+919104427875"
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    +91 9104427875
                  </a>
                </p>

                {/* Email → Opens Email App */}
                <p style={{ fontSize: "0.85rem" }}>
                  <i className="fa fa-envelope me-2"></i>
                  <a
                    href="mailto:tsorganicmall0623@gmail.com"
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    tsorganicmall0623@gmail.com
                  </a>
                </p>
              </div>

              <div className="col-lg-3 col-md-6">
                <h3 className="text-light mb-3 py-1">Quick Links</h3>
                <Link className="btn btn-link p-0" to="/about">About Us</Link>
                <Link className="btn btn-link p-0" to="/contact">Contact Us</Link>
                <Link className="btn btn-link p-0" to="/faqs">FAQs</Link>
                {/* <Link className="btn btn-link p-0" to="/feature">Our Features</Link> */}
                <Link className="btn btn-link p-0" to="/Support">Help </Link>
                <button className="btn btn-link  p-0" data-bs-toggle="modal" data-bs-target="#termsModal">Terms & Conditions</button>
              </div>

              <div className="col-lg-3 col-md-6 ">
                <img src="/img/baglogo.png" alt='' style={{ height: 250, width: 250, borderRadius: "25px" }}></img> </div>


            </div>
          </div>

          {/* Reduced copyright height */}
          <div className="container-fluid copyright py-1">
            <div className="container">
              <div className="row">
                <div className="col-12 text-center" style={{ fontSize: "0.8rem" }}>
                  &copy; 2026 <a href="/">TS Organic Mall</a>, All Right Reserved.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showOnlyLine && !showFullFooter && (
        <div className="container-fluid bg-dark text-light py-2 text-center" style={{ fontSize: "0.8rem" }}>
          &copy; 2026 TS Organic Mall, All Right Reserved.
        </div>

      )}

      <div
        className="modal fade"
        id="termsModal"
        tabIndex={-1}
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg modal-dialog-scrollable">
          <div className="modal-content">

            <div className="modal-header">
              <h5 className="modal-title">
                Terms & Conditions - TS Organic Mall
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
              ></button>
            </div>

            <div className="modal-body">
              <p>Welcome to TS Organic Mall. By accessing or using our website, you agree to be bound by these Terms & Conditions.</p>
              <h6>1. Use of Website</h6>
              <p>You may browse and purchase for lawful purposes only.</p>
              <h6>2. Products and Orders</h6>
              <p>Prices and availability are subject to change.</p>
              <h6>3. Payment and Billing</h6>
              <p>Payments must be completed via authorized gateways.</p>
              <h6>4. Shipping and Delivery</h6>
              <p>Delivery timelines may vary due to external factors.</p>
              <h6>5. Returns and Refunds</h6>
              <p>Refunds processed after verification.</p>
              <h6>6. User Conduct</h6>
              <p>Misuse may result in account suspension.</p>
              <h6>7. Intellectual Property</h6>
              <p>All content belongs to TS Organic Mall.</p>
              <h6>8. Limitation of Liability</h6>
              <p>We are not liable for indirect damages.</p>
              <h6>9. Changes to Terms</h6>
              <p>Terms may be updated anytime.</p>
              <h6>10. Governing Law</h6>
              <p>Governed by laws of India - Anand, Gujarat jurisdiction.</p>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
}

export default Footer;
