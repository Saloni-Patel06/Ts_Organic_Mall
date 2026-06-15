import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CheckoutStepper from "../components/CheckoutStepper";
import { apiFetch } from "../utils/apiFetch";

const SelectAddress = () => {
  const navigate = useNavigate();
  const [address, setAddress] = useState({ name: "", mobile: "", address: "", city: "Anand", pincode: "", state: "Gujarat" });
  const [scheduleDate, setScheduleDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [subtotal, setSubtotal] = useState(0);
  const [itemCount, setItemCount] = useState(0);
  const [items, setItems] = useState([]);

  const timeSlots = ["9:00 AM - 12:00 PM", "1:00 PM - 4:00 PM", "4:00 PM - 7:00 PM"];

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) { navigate("/select-address"); return; }
    const localAddress = {
      name: localStorage.getItem("name") || "", mobile: localStorage.getItem("mobile") || "",
      address: localStorage.getItem("address") || "", city: localStorage.getItem("city") || "Anand",
      pincode: localStorage.getItem("pincode") || "", state: "Gujarat"
    };
    setAddress(localAddress);
    apiFetch(`/users/${userId}`).then(res => res.json()).then(user => {
      if (user) {
        const dbAddress = { name: user.name || localAddress.name, mobile: user.mobile || localAddress.mobile, address: user.address || localAddress.address, city: user.city || localAddress.city, pincode: user.pincode || localAddress.pincode, state: "Gujarat" };
        setAddress(dbAddress);
        Object.keys(dbAddress).forEach(key => localStorage.setItem(key, dbAddress[key]));
      }
    }).catch(err => console.error(err));
  }, [navigate]);

  useEffect(() => {
    setSubtotal(Number(localStorage.getItem("cartSubtotal")) || 0);
    setItemCount(Number(localStorage.getItem("cartItemCount")) || 0);
    setItems(JSON.parse(localStorage.getItem("cartItems") || "[]"));
  }, []);

  const deliveryCharge = subtotal >= 1000 ? 0 : 70;
  const gst = subtotal * 0.05;
  const discount = subtotal >= 1500 ? subtotal * 0.1 : 0;
  const orderTotal = subtotal + deliveryCharge + gst - discount;
  const today = new Date().toISOString().split("T")[0];

  const isSlotDisabled = (slot) => {
    if (!scheduleDate || scheduleDate !== today) return false;
    const [, endTime] = slot.split(" - ");
    const parseTime = (t) => { let [h, mp] = t.split(":"); const [m, ap] = [Number(mp.split(" ")[0]), mp.split(" ")[1]]; h = Number(h); if (ap === "PM" && h !== 12) h += 12; if (ap === "AM" && h === 12) h = 0; return h * 60 + m; };
    return new Date().getHours() * 60 + new Date().getMinutes() >= parseTime(endTime);
  };

  const handleContinue = () => {
    if (!scheduleDate || !timeSlot) { alert("Please select schedule and time slot"); return; }
    if (!address.name || !address.address) { alert("Please fill address details"); return; }
    navigate("/Cust-Payment", { state: { itemCount, subtotal, deliveryCharge, gst, discount, orderTotal, selectedAddress: address, scheduledDate: scheduleDate, timeSlot, items } });
  };

  const S = {
    page: { background: "#f3f3f7", minHeight: "100vh", padding: "90px 0 40px" },
    card: { background: "#fff", borderRadius: 16, padding: 12, marginBottom: 16 },
    label: { fontSize: 12, fontWeight: 600, color: "#555", marginBottom: 4, display: "block" },
    input: { width: "100%", border: "1.5px solid #e0e0e0", borderRadius: 8, padding: "7px 10px", fontSize: 13, outline: "none", background: "#fafafa" },
    sectionTitle: { fontSize: 16, fontWeight: 800, color: "#1a1a1a", marginBottom: 14 },
    billRow: { display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6, color: "#444" },
    totalBar: { display: "flex", justifyContent: "space-between", alignItems: "center", background: "#dca314d1", borderRadius: 10, padding: "8px 12px", margin: "8px 0" },
    btn: { background: "#3CB815", color: "#fff", border: "none", borderRadius: 10, width: "100%", padding: 11, fontSize: 16, fontWeight: 700, cursor: "pointer" },
  };

  return (
    <div style={S.page}>
      <div className="container" style={{ paddingTop: 10 }}>
        <CheckoutStepper currentStep={2} />

        <div className="row g-4">

          {/* LEFT — Address only */}
          <div className="col-lg-7">
            <div style={S.card}>
              <div style={S.sectionTitle}>📍 Delivery Address</div>
              <div className="row g-2">
                {[{ name: "name", label: "Full Name", type: "text" }, { name: "mobile", label: "Mobile Number", type: "tel" }, { name: "pincode", label: "Pincode", type: "text" }].map(f => (
                  <div key={f.name} className="col-md-6">
                    <label style={S.label}>{f.label}</label>
                    <input type={f.type} style={S.input} value={address[f.name]} onChange={e => setAddress(p => ({ ...p, [f.name]: e.target.value }))} />
                  </div>
                ))}
                <div className="col-md-6">
                  <label style={S.label}>City</label>
                  <input style={{ ...S.input, background: "#f0f0f0", color: "#888" }} value={address.city} disabled />
                </div>
                <div className="col-12">
                  <label style={S.label}>Address</label>
                  <textarea style={{ ...S.input, resize: "none" }} rows={2} value={address.address} onChange={e => setAddress(p => ({ ...p, address: e.target.value }))} />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT — Schedule + Bill Summary */}
          <div className="col-lg-5">
            <div style={{ ...S.card, position: "sticky", top: 90 }}>

              {/* Schedule */}
              <div style={S.sectionTitle}>🗓️ Schedule Delivery</div>
              <div className="row g-2" style={{ marginBottom: 8 }}>
                <div className="col-6">
                  <label style={S.label}>Delivery Date</label>
                  <input type="date" style={S.input} value={scheduleDate} min={today} onChange={e => setScheduleDate(e.target.value)} />
                </div>
                <div className="col-6">
                  <label style={S.label}>Time Slot</label>
                  <select style={S.input} value={timeSlot} onChange={e => setTimeSlot(e.target.value)}>
                    <option value="">Select Time Slot</option>
                    {timeSlots.map(slot => <option key={slot} value={slot} disabled={isSlotDisabled(slot)}>{slot}</option>)}
                  </select>
                </div>
              </div>

              <hr style={{ margin: "0 0 16px" }} />

              {/* Bill */}
              <div style={S.sectionTitle}>Bill Details</div>
              <div style={{ background: "#f8f8f8", borderRadius: 10, padding: "10px 12px", marginBottom: 8 }}>
                <div style={S.billRow}><span>MRP Total</span><span style={{ fontWeight: 600 }}>₹{subtotal.toFixed(2)}</span></div>
                <div style={S.billRow}><span>Delivery Charge</span><span style={{ color: deliveryCharge === 0 ? "#3CB815" : "#1a1a1a", fontWeight: 600 }}>{deliveryCharge === 0 ? "🚚 FREE" : `₹${deliveryCharge}`}</span></div>
                <div style={{ ...S.billRow, marginBottom: 0 }}><span>GST (5%)</span><span style={{ fontWeight: 600 }}>₹{gst.toFixed(2)}</span></div>
                {discount > 0 && <div style={{ ...S.billRow, color: "#3CB815", fontWeight: 600, marginTop: 8, marginBottom: 0 }}><span>🎁 Discount (10%)</span><span>− ₹{discount.toFixed(2)}</span></div>}
              </div>

              <div style={S.totalBar}>
                <span style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>Grand Total</span>
                <span style={{ color: "#fff", fontWeight: 800, fontSize: 16 }}>₹{orderTotal.toFixed(2)}</span>
              </div>

              {discount > 0 && (
                <div style={{ background: "#e8f5e9", borderRadius: 8, padding: "6px 12px", fontSize: 12, color: "#2e7d32", fontWeight: 600, marginBottom: 8 }}>
                  🎉 You're saving ₹{discount.toFixed(2)} on this order!
                </div>
              )}

              <button style={S.btn} onClick={handleContinue}>Continue to Payment →</button>
              <div style={{ textAlign: "center", marginTop: 10, fontSize: 12, color: "#aaa" }}>🔒 Safe & Secure Payments</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SelectAddress;

