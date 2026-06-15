import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch } from "../utils/apiFetch";

const Home = ({ cartQty = {}, setCartQty }) => {

  const navigate = useNavigate();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    apiFetch("/manage-products")
      .then(res => res.json())
      .then(data => setProducts(Array.isArray(data) ? data : []))
      .catch(err => console.error("Products fetch error:", err));
  }, []);

  const cartKey = (p) => `${p.id}_${p.unit}`;

  const addToCart = async (p) => {
    const key = cartKey(p);
    const currentQty = cartQty[key] || 0;
    if (currentQty >= p.stock) { alert("Out of Stock"); return; }
    try {
      await apiFetch("/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: p.id, productName: p.name, price: p.price, quantity: 1, unit: p.unit })
      });
    } catch (e) { console.error(e); }
    setCartQty(prev => ({ ...prev, [key]: currentQty + 1 }));
  };

  const increaseQty = async (p) => {
    const key = cartKey(p);
    const currentQty = cartQty[key] || 0;
    if (currentQty >= p.stock) { alert("Out of Stock"); return; }
    try {
      await apiFetch("/cart/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: p.id, quantity: currentQty + 1, unit: p.unit })
      });
    } catch (e) { console.error(e); }
    setCartQty(prev => ({ ...prev, [key]: currentQty + 1 }));
  };

  const decreaseQty = async (p) => {
    const key = cartKey(p);
    const currentQty = cartQty[key] || 0;
    try {
      if (currentQty - 1 <= 0) {
        await apiFetch("/cart/remove", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: p.id, unit: p.unit })
        });
      } else {
        await apiFetch("/cart/update", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: p.id, quantity: currentQty - 1, unit: p.unit })
        });
      }
    } catch (e) { console.error(e); }
    setCartQty(prev => {
      const qty = (prev[key] || 0) - 1;
      if (qty <= 0) { const u = { ...prev }; delete u[key]; return u; }
      return { ...prev, [key]: qty };
    });
  };

  const totalItems = Object.values(cartQty || {}).reduce((a, b) => a + b, 0);


  return (
    <>

      {/* Carousel */}

      <div className="container-fluid p-0 mb-5 ">
        <div id="header-carousel" className="carousel slide" data-bs-ride="carousel">
          <div className="carousel-inner">
            <div className="carousel-item active">
              <img className="w-100" src="img/carousel-1.jpg" alt="" />
              <div className="carousel-caption">
                <div className="container">
                  <div className="row justify-content-start">
                    <div className="col-lg-7">
                      <h1 className="display-2 mb-5 ">Organic Food Is Good For Health</h1>
                      <Link to="/Products" className="btn btn-primary rounded-pill py-sm-3 px-sm-5"> View Products</Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="carousel-item">
              <img className="w-100" src="img/carousel-2.jpg" alt="" />
              <div className="carousel-caption">
                <div className="container">
                  <div className="row justify-content-start">
                    <div className="col-lg-7">
                      <h1 className="display-2 mb-5 ">Natural Food Is Always Healthy</h1>
                      <Link to="/Products" className="btn btn-primary rounded-pill py-sm-3 px-sm-5"> View Products</Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <button
            className="carousel-control-prev"
            type="button"
            data-bs-target="#header-carousel"
            data-bs-slide="prev"
            style={{ width: "40px" }}
          >
            <span
              className="carousel-control-prev-icon"
              aria-hidden="true"
              style={{ transform: "scale(0.7)" }}
            ></span>
            <span className="visually-hidden">Previous</span>
          </button>

          <button
            className="carousel-control-next"
            type="button"
            data-bs-target="#header-carousel"
            data-bs-slide="next"
            style={{ width: "40px" }}
          >
            <span
              className="carousel-control-next-icon"
              aria-hidden="true"
              style={{ transform: "scale(0.7)" }}
            ></span>
            <span className="visually-hidden">Next</span>
          </button>

        </div>
      </div>


      {/* ---------About------------- */}
      <div className="container-xxl py-5">
        <div
          className="section-header text-center mx-auto mb-5 "
          style={{ maxWidth: 500 }}
        >
          <h1 className="display-5 mb-3">About Us</h1>

        </div>
        <div className="container">
          <div className="row g-5 align-items-center">
            <div className="col-lg-6">
              <div className="about-img position-relative overflow-hidden p-5 pe-0">
                <img className="img-fluid w-100" src="img/about.jpg" alt="Organic Vegetables" />
              </div>
            </div>
            <div className="col-lg-6">
              <h1 className="display-5 mb-4">Best Organic Fruits And Vegetables</h1>
              <p>Fresh and organic food directly from farms.</p>
              <p>
                We partner with local farmers to bring sustainable and eco-friendly farming practices
                straight to your table. From farm to fork, every step is monitored for quality and freshness.
              </p>
              <p>
                Join our community of conscious consumers who value health, sustainability, and
                premium-quality produce. Experience the natural difference with TS Organic Mall.
              </p>
              <Link to="/products" className="btn btn-primary rounded-pill py-3 px-5 mt-3">
                Explore Products
              </Link>
            </div>
          </div>
        </div>
      </div>


      {/* product start */}

      {/* ===== PRODUCTS SECTION ===== */}
      <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
          <h4 style={{ fontWeight: 800, color: "#1a1a1a" }}>Fresh Groceries 🛒</h4>
          <Link to="/products" className="btn btn-outline-success btn-sm rounded-pill px-4">View All →</Link>
        </div>

        <style>{`
          .unit-badge-h { display:inline-block; background:#f0f0f0; color:#555; border-radius:6px; font-size:11px; font-weight:600; padding:2px 7px; margin-bottom:3px; }
          .prod-card-h { background:#fff; border-radius:14px; border:1px solid #e8e8e8; overflow:hidden; transition:box-shadow 0.2s; }
          .prod-card-h:hover { box-shadow:0 4px 18px rgba(0,0,0,0.10); }
          .prod-img-h { width:100%; height:200px; object-fit:cover; background:#f5f5f5; }
          .add-btn-h { background:#fff; border:2px solid #3CB815; color:#3CB815; border-radius:8px; font-weight:700; font-size:14px; padding:3px 14px; cursor:pointer; }
          .add-btn-h:hover { background:#3CB815; color:#fff; }
          .qty-box-h { display:flex; align-items:center; background:#3CB815; border-radius:8px; overflow:hidden; }
          .qty-btn-h { background:transparent; border:none; color:#fff; font-size:17px; font-weight:700; padding:2px 9px; cursor:pointer; }
          .qty-num-h { color:#fff; font-weight:700; font-size:14px; min-width:22px; text-align:center; }
          .col-5th { width:20%; padding:0 6px; }
          @media(max-width:1199px){.col-5th{width:33.33%;}}
          @media(max-width:767px){.col-5th{width:50%;}}
          .cart-bar-h { position:fixed; bottom:0; left:0; right:0; background:#3CB815; color:#fff; padding:12px 24px; display:flex; justify-content:space-between; align-items:center; z-index:999; box-shadow:0 -2px 12px rgba(0,0,0,0.15); }
          .cart-bar-btn-h { background:#fff; color:#3CB815; border:none; border-radius:8px; font-weight:700; padding:6px 20px; font-size:14px; cursor:pointer; }
        `}</style>

        <div className="row g-3">
          {products.map((p) => {
            const key = cartKey(p);
            const qty = cartQty[key] || 0;
            return (
              <div key={key} className="col-5th">
                <div className="prod-card-h">
                  <img src={p.img} alt={p.name} className="prod-img-h" />
                  <div style={{ padding: "10px 12px 12px" }}>
                    <div className="unit-badge-h">{p.unit}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#1a1a1a", marginBottom: 2 }}>{p.name}</div>
                    {qty > 0 && (() => {
                      const match = p.unit?.match(/([\d.]+)\s*(kg|gm|g|pc|pcs|ltr|ml)/i);
                      if (!match) return <div style={{fontSize:11,color:'#3CB815',fontWeight:600,marginBottom:2}}>{qty} × {p.unit}</div>;
                      const val = parseFloat(match[1]) * qty;
                      const u = match[2].toLowerCase();
                      let display;
                      if (u==='gm'||u==='g') display = val>=1000 ? `${(val/1000).toFixed(2).replace(/\.?0+$/,'')} kg` : `${val} gm`;
                      else if (u==='ml') display = val>=1000 ? `${(val/1000).toFixed(2).replace(/\.?0+$/,'')} ltr` : `${val} ml`;
                      else display = `${val} ${u}`;
                      return <div style={{fontSize:11,color:'#3CB815',fontWeight:600,marginBottom:2}}>{qty} × {p.unit} = {display}</div>;
                    })()}
                    <div className="d-flex justify-content-between align-items-center mt-2">
                      <span style={{ fontSize: 16, fontWeight: 800 }}>₹{p.price}</span>
                      {!qty ? (
                        <button className="add-btn-h" onClick={() => addToCart(p)} disabled={p.stock === 0}>ADD</button>
                      ) : (
                        <div className="qty-box-h">
                          <button className="qty-btn-h" onClick={() => decreaseQty(p)}>−</button>
                          <span className="qty-num-h">{qty}</span>
                          <button className="qty-btn-h" onClick={() => increaseQty(p)}>+</button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {totalItems > 0 && (
          <div className="cart-bar-h">
            <span style={{ fontSize: 15, fontWeight: 700 }}>{totalItems} item{totalItems > 1 ? "s" : ""} added</span>
            <button className="cart-bar-btn-h" onClick={() => navigate("/cart")}>View Cart →</button>
          </div>
        )}
      </div>

          {/* product end  */}

          {/* Features */}
          <div className="container-fluid bg-light  my-4 py-6">
            <div className="container justify-content-center">
              <div
                className="section-header text-center mx-auto mb-5"
                style={{ maxWidth: 500 }}
              >
                <h1 className="display-5 mb-3">Our Features</h1>
                <p>Why customers trust us</p>
              </div>

              <div className="row g-4">
                <div className="col-lg-4 d-flex flex-column align-items-center">
                  <img src="img/icon-1.png" className="img-fluid mb-3" alt="Natural process" />
                  <h4>Natural Process</h4>
                </div>

                <div className="col-lg-4 d-flex flex-column align-items-center">
                  <img src="img/icon-2.png" className="img-fluid mb-3" alt="Organic products" />
                  <h4>Organic Products</h4>
                </div>

                <div className="col-lg-4 d-flex flex-column align-items-center">
                  <img src="img/icon-3.png" className="img-fluid mb-3" alt="Biologically safe" />
                  <h4>Biologically Safe</h4>
                </div>
              </div>
            </div>
          </div>

          {/* certifications */}
          <div className="container-fluid bg-light bg-icon py-6 mb-5">
            <div className="container">
              <div className="section-header text-center mx-auto mb-5" style={{ maxWidth: 500 }}>
                <h1 className="display-5 mb-3">Our Certifications</h1>
                <p>Ensuring quality and trust through recognized certifications.</p>
              </div>
              <div className="d-flex justify-content-center">
                <div className="d-flex overflow-auto gap-5 py-3">
                  <img src="img/certi1.png" alt="Certificate 1" style={{ height: 500, width: 350 }} />

                  <img src="img/certi3.png" alt="Certificate 3" style={{ height: 500, width: 350 }} />
                  <img src="img/certi2.png" alt="Certificate 2" style={{ height: 500, width: 350 }} />
                </div>
              </div>
            </div>
          </div>

          {/* Reviews */}
          <div className="container-fluid bg-light py-6 mb-5">
            <div className="container">
              <div
                className="section-header text-center mx-auto mb-5 "
                style={{ maxWidth: 500 }}
              >
                <h1 className="display-5 mb-3">Customer Reviews</h1>
                <p>
                  Trusted by customers for quality, freshness, and reliable service.
                </p>
              </div>

              <div className="row g-4 ">
                <div className="col-lg-6 col-md-6">
                  <div className="testimonial-item position-relative bg-white p-5 h-100">
                    <i className="fa fa-quote-left fa-3x text-primary position-absolute top-0 start-0 mt-n4 ms-5"></i>
                    <p className="mb-4">
                      Fresh produce and timely delivery. Consistently reliable quality.
                    </p>
                    <div className="d-flex align-items-center">
                      <img
                        src="img/testimonial-1.jpg"
                        alt=""
                        style={{
                          width: '80px',
                          height: '80px',
                          objectFit: 'cover',
                          borderRadius: '50%'
                        }}
                      />

                      <div className="ms-3">
                        <h5 className="mb-1">Anita Sharma</h5>
                        <span>Retail Store Owner</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-lg-6 col-md-6">
                  <div className="testimonial-item position-relative bg-white p-5 h-100">
                    <i className="fa fa-quote-left fa-3x text-primary position-absolute top-0 start-0 mt-n4 ms-5"></i>
                    <p className="mb-4">
                      Excellent packaging and farm-fresh quality every time.
                    </p>
                    <div className="d-flex align-items-center">
                      <img
                        src="img/testimonial-2.jpg"
                        alt=""
                        style={{
                          width: '80px',
                          height: '80px',
                          objectFit: 'cover',
                          borderRadius: '50%'
                        }}
                      />

                      <div className="ms-3">
                        <h5 className="mb-1">Suhana singh</h5>
                        <span>Wholesale Buyer</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-lg-6 col-md-6">
                  <div className="testimonial-item position-relative bg-white p-5 h-100">
                    <i className="fa fa-quote-left fa-3x text-primary position-absolute top-0 start-0 mt-n4 ms-5"></i>
                    <p className="mb-4">
                      Reliable supply and fair pricing. Highly recommended.
                    </p>
                    <div className="d-flex align-items-center">
                      <img
                        src="img/testimonial-3.jpg?v=1"
                        alt=""
                        style={{
                          width: '80px',
                          height: '80px',
                          objectFit: 'cover',
                          borderRadius: '50%'
                        }}
                      />
                      <div className="ms-3">
                        <h5 className="mb-1">Prachi Raval</h5>
                        <span>Restaurant Manager</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-lg-6 col-md-6">
                  <div className="testimonial-item position-relative bg-white p-5 h-100">
                    <i className="fa fa-quote-left fa-3x text-primary position-absolute top-0 start-0 mt-n4 ms-5"></i>
                    <p className="mb-4">
                      Smooth ordering experience and responsive support.
                    </p>
                    <div className="d-flex align-items-center">
                      <img
                        src="img/testimonial-4.jpg"
                        alt=""
                        style={{
                          width: '80px',
                          height: '80px',
                          objectFit: 'cover',
                          borderRadius: '50%'
                        }}
                      />
                      <div className="ms-3">
                        <h5 className="mb-1">Pranjal Patel</h5>
                        <span>Home Customer</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>



          {/* Contact us */}

          <div className="container-fluid bg-light py-6 mb-5">
            <div className="container">
              <div className="section-header text-center mx-auto mb-5" style={{ maxWidth: 500 }}>
                <h1 className="display-5 mb-3">Contact Us</h1>

              </div>

              <div className="row g-5 justify-content-center">
                <div className="col-lg-5 col-md-12 ">
                  <div className="container-xxl px-0 " style={{ marginBottom: -6 }}>
                    <iframe className="w-100" style={{ height: 450, border: 0 }} src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d58956.92440787993!2d72.9447341!3d22.5488724!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395e4e7efd0c8885%3A0xa9a0b93c0c4b5215!2sAnand%2C%20Gujarat!5e0!3m2!1sen!2sin!4v1768024074332" loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen title="Anand Location Map" />
                  </div>
                </div>

                <div className="col-lg-7 col-md-12 ">
                  <p className="mb-4">Connect with our team for inquiries, support, or collaboration opportunities. We're here to assist.</p>
                  <form onSubmit={(e) => e.preventDefault()}>
                    <div className="row g-3">
                      <div className="col-md-6"><div className="form-floating"><input type="text" className="form-control rounded-0" id="name" placeholder="Your Name" /><label htmlFor="name">Your Name</label></div></div>
                      <div className="col-md-6"><div className="form-floating"><input type="email" className="form-control rounded-0" id="email" placeholder="Your Email" /><label htmlFor="email">Your Email</label></div></div>
                      <div className="col-12"><div className="form-floating"><textarea className="form-control rounded-0" id="message" placeholder="Leave a message here" style={{ height: 200 }}></textarea><label htmlFor="message">Message</label></div></div>
                      <div className="col-12"><button className="btn btn-primary rounded-0 py-3 px-5" type="submit">Send Message</button></div>
                    </div>
                  </form>
                </div>
              </div>
            </div>


            {/* <!-- Back to Top --> */}
            <a href="/" className="btn btn-lg btn-primary btn-lg-square rounded-circle back-to-top"><i className="bi bi-arrow-up"></i></a>
          </div >
        {/* </div> */}
      {/* </div> */}

    </>
  );
}

export default Home;