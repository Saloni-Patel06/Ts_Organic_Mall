import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import CheckoutStepper from "../components/CheckoutStepper";
import PaymentButton from "../components/PaymentButton";

const CustPayment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const orderData = location.state;

  useEffect(() => {
    if (!orderData) navigate("/select-address");
  }, [orderData, navigate]);

  const orderDataWithCustomer = {
    ...orderData,
    customerName: localStorage.getItem("name") || "Customer",
    customerEmail: localStorage.getItem("email") || "",
    customerId: localStorage.getItem("userId") || "",
  };

  const handleProceedToSummary = () => {
    navigate("/summary", { state: { ...orderData, paymentMethod: "online", paymentCompleted: true } });
  };

  if (!orderData) return null;

  const { subtotal = 0, deliveryCharge = 0, gst = 0, discount = 0, orderTotal = 0, itemCount = 0 } = orderData;

  const S = {
    page: { background: "#f3f3f7", minHeight: "100vh", padding: "90px 0 40px" },
    card: { background: "#fff", borderRadius: 16, padding: 16, marginBottom: 16 },
    sectionTitle: { fontSize: 16, fontWeight: 800, color: "#1a1a1a", marginBottom: 14 },
    billRow: { display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 8, color: "#444" },
    totalBar: { display: "flex", justifyContent: "space-between", alignItems: "center", background: "#dca314d1", borderRadius: 10, padding: "10px 14px", margin: "10px 0" },
  };

  return (
    <div style={S.page}>
      <div className="container" style={{ paddingTop: 10 }}>
        <CheckoutStepper currentStep={3} />
        <div className="row g-4 justify-content-center">


          {/* RIGHT — Bill Summary */}
          <div className="col-lg-4">
            <div style={{ ...S.card, position: "sticky", top: 90 }}>
              <div style={S.sectionTitle}>Bill Details</div>

              <div style={{ background: "#f8f8f8", borderRadius: 10, padding: "12px 14px", marginBottom: 10 }}>
                <div style={S.billRow}><span>Items</span><span style={{ fontWeight: 600 }}>{itemCount}</span></div>
                <div style={S.billRow}><span>MRP Total</span><span style={{ fontWeight: 600 }}>₹{subtotal.toFixed(2)}</span></div>
                <div style={S.billRow}><span>Delivery</span><span style={{ color: deliveryCharge === 0 ? "#3CB815" : "#1a1a1a", fontWeight: 600 }}>{deliveryCharge === 0 ? "🚚 FREE" : `₹${deliveryCharge}`}</span></div>
                <div style={{ ...S.billRow, marginBottom: 0 }}><span>GST (5%)</span><span style={{ fontWeight: 600 }}>₹{gst.toFixed(2)}</span></div>
                {discount > 0 && <div style={{ ...S.billRow, color: "#3CB815", fontWeight: 600, marginTop: 8, marginBottom: 0 }}><span>🎁 Discount</span><span>− ₹{discount.toFixed(2)}</span></div>}
              </div>

              <div style={S.totalBar}>
                <span style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>Grand Total</span>
                <span style={{ color: "#fff", fontWeight: 800, fontSize: 17 }}>₹{orderTotal.toFixed(2)}</span>
              </div>

              {discount > 0 && (
                <div style={{ background: "#e8f5e9", borderRadius: 8, padding: "8px 12px", fontSize: 13, color: "#2e7d32", fontWeight: 600 }}>
                  🎉 You're saving ₹{discount.toFixed(2)}!
                </div>
              )}
            </div>
          </div>
          {/* LEFT — Payment */}
          <div className="col-lg-5">
            <div style={S.card}>
              <div style={S.sectionTitle}>💳 Payment</div>

              <div style={{ background: "#f8f8f8", borderRadius: 10, padding: "14px", marginBottom: 16, textAlign: "center" }}>
                <div style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>Amount to Pay</div>
                <div style={{ fontSize: 30, fontWeight: 800, color: "#1a1a1a" }}>₹{orderTotal.toFixed(2)}</div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#e8f5e9", borderRadius: 10, padding: "12px 14px", marginBottom: 16 }}>
                <span style={{ fontSize: 20 }}>🏦</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#1a1a1a" }}>Online Payment Only</div>
                  <div style={{ fontSize: 12, color: "#666" }}>UPI / Debit Card / Credit Card / Net Banking</div>
                </div>
              </div>

              <PaymentButton
                amount={orderData.orderTotal}
                orderData={orderDataWithCustomer}
                buttonText="Pay Securely"
                onPaymentSuccess={handleProceedToSummary}
              />

              <div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 14 }}>
                {["Visa", "Mastercard", "UPI", "Razorpay"].map(m => (
                  <span key={m} style={{ fontSize: 11, background: "#f0f0f0", borderRadius: 6, padding: "3px 8px", color: "#555", fontWeight: 600 }}>{m}</span>
                ))}
              </div>
              <div style={{ textAlign: "center", marginTop: 10, fontSize: 12, color: "#aaa" }}>🔒 100% Safe & Secure Payments</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CustPayment;

