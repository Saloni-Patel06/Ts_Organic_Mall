import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import CheckoutStepper from "../components/CheckoutStepper";

const Summary = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    if (!location.state) { navigate("/cart"); return; }
    setOrder(location.state);
  }, [navigate, location.state]);

  if (!order) return null;

  const { itemCount = 0, subtotal = 0, deliveryCharge = 0, gst = 0, discount = 0, orderTotal = 0, selectedAddress, scheduledDate, timeSlot, items = [] } = order;

  const S = {
    page: { background: "#f3f3f7", minHeight: "100vh", padding: "90px 0 40px" },
    card: { background: "#fff", borderRadius: 16, padding: 12, marginBottom: 16 },
    sectionTitle: { fontSize: 16, fontWeight: 800, color: "#1a1a1a", marginBottom: 8 },
    billRow: { display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4, color: "#444" },
    totalBar: { display: "flex", justifyContent: "space-between", alignItems: "center", background: "#dca314d1", borderRadius: 10, padding: "6px 10px", margin: "4px 0" },
    btn: { background: "#3CB815", color: "#fff", border: "none", borderRadius: 10, width: "100%", padding: 10, fontSize: 15, fontWeight: 700, cursor: "pointer" },
    infoChip: { background: "#f0f0f0", borderRadius: 8, padding: "4px 10px", fontSize: 12, color: "#444", fontWeight: 600 },
  };

  return (
    <div style={S.page}>
      <div className="container" style={{ paddingTop: 10 }}>
        <CheckoutStepper currentStep={4} />
        <div className="row g-4">

          {/* LEFT — Items + Delivery Info */}
          <div className="col-lg-8">
            <div style={S.card}>
              <div style={S.sectionTitle}>🛒 Order Items ({itemCount} items)</div>
              {items.length > 0 ? items.map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: i < items.length - 1 ? "1px solid #f0f0f0" : "none" }}>
                  <div style={{ width: 48, height: 48, borderRadius: 6, background: "#f5f5f5", overflow: "hidden", flexShrink: 0 }}>
                    <img src={item.img || "/img/default.png"} alt={item.productName} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => e.target.src = "/img/default.png"} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#1a1a1a" }}>{item.productName}</div>
                    <div style={{ fontSize: 11, color: "#888" }}>{item.unit} × {item.quantity}</div>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#1a1a1a" }}>₹{(item.price * item.quantity).toFixed(2)}</div>
                </div>
              )) : <p style={{ color: "#888", fontSize: 13 }}>No items</p>}
            </div>

            <div style={S.card}>
              <div style={S.sectionTitle}>🚚 Delivery Details</div>
              <div className="row g-2">
                <div className="col-md-4">
                  <div style={S.infoChip}>
                    <div style={{ fontSize: 10, color: "#888", marginBottom: 1 }}>Date</div>
                    <div>{scheduledDate || "N/A"}</div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div style={S.infoChip}>
                    <div style={{ fontSize: 10, color: "#888", marginBottom: 1 }}>Time</div>
                    <div>{timeSlot || "N/A"}</div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div style={S.infoChip}>
                    <div style={{ fontSize: 10, color: "#888", marginBottom: 1 }}>Payment</div>
                    <div>✅ Paid</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT — Address + Bill */}
          <div className="col-lg-4">
            <div style={{ ...S.card, position: "sticky", top: 90 }}>

              <div style={{ ...S.sectionTitle, marginBottom: 4 }}>📍 Address</div>
              <div style={{ background: "#f8f8f8", borderRadius: 10, padding: "8px 10px", marginBottom: 8 }}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{selectedAddress?.name}</div>
                <div style={{ fontSize: 12, color: "#555" }}>{selectedAddress?.address}, {selectedAddress?.city}</div>
                <div style={{ fontSize: 12, color: "#555" }}>{selectedAddress?.state} - {selectedAddress?.pincode}</div>
                <div style={{ fontSize: 12, color: "#555", marginTop: 2 }}>📞 {selectedAddress?.mobile}</div>
              </div>

              <div style={S.sectionTitle}> Bill</div>
              <div style={{ background: "#f8f8f8", borderRadius: 10, padding: "8px 10px", marginBottom: 4 }}>
                <div style={S.billRow}><span>MRP Total</span><span style={{ fontWeight: 600 }}>₹{subtotal.toFixed(2)}</span></div>
                <div style={S.billRow}><span>Delivery</span><span style={{ color: deliveryCharge === 0 ? "#3CB815" : "#1a1a1a", fontWeight: 600 }}>{deliveryCharge === 0 ? "FREE" : `₹${deliveryCharge}`}</span></div>
                <div style={{ ...S.billRow, marginBottom: 0 }}><span>GST (5%)</span><span style={{ fontWeight: 600 }}>₹{gst.toFixed(2)}</span></div>
                {discount > 0 && <div style={{ ...S.billRow, color: "#3CB815", fontWeight: 600, marginTop: 4 }}><span>Discount</span><span>− ₹{discount.toFixed(2)}</span></div>}
              </div>

              <div style={S.totalBar}>
                <span style={{ color: "#fff", fontWeight: 700, fontSize: 13 }}>Total</span>
                <span style={{ color: "#fff", fontWeight: 800, fontSize: 15 }}>₹{orderTotal.toFixed(2)}</span>
              </div>

              {discount > 0 && (
                <div style={{ background: "#e8f5e9", borderRadius: 8, padding: "4px 10px", fontSize: 11, color: "#2e7d32", fontWeight: 600, marginBottom: 8 }}>
                  Saved ₹{discount.toFixed(2)}
                </div>
              )}

              <button style={S.btn} onClick={() => navigate("/order-success")}>Continue</button>
              <div style={{ textAlign: "center", marginTop: 10, fontSize: 12, color: "#aaa" }}>🔒 Safe & Secure Payments</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Summary;
