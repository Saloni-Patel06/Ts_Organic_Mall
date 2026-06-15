import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { generateInvoice } from "../utils/invoiceUtils";
import { apiFetch } from "../utils/apiFetch";

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);

  const handleCancelOrder = async () => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;

    try {
      const response = await apiFetch(`/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Cancelled' })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to cancel order');
      }

      // Optimistic update
      setOrder(prev => ({ ...prev, status: 'Cancelled' }));
      alert('Order cancelled successfully!');
    } catch (error) {
      console.error('Cancel error:', error);
      alert('Error: ' + error.message);
    }
  };

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await apiFetch(`/orders/${id}`);
        if (!response.ok) throw new Error("Order not found");
        const data = await response.json();
        console.log("Order data:", data);
        setOrder(data);
      } catch (error) {
        console.error("Error fetching order:", error);
        setOrder(null);
      }
    };

    fetchOrder();
  }, [id]);

  if (!order) {
    return <h3 style={{ padding: 20, textAlign: "center", marginTop: 100 }}>Loading...</h3>;
  }

  const getItemImage = (item) => {
    if (item.img) return item.img;
    if (item.productImage) return item.productImage;
    return "/img/default.png";
  };

  const subtotal = order.subtotal || order.items?.reduce((sum, item) => sum + item.quantity * item.price, 0) || 0;
  const gst = order.gst || (subtotal * 0.05);
  const discount = order.discount || 0;
  const delivery = order.deliveryCharge || 0;
  const total = order.totalAmount || (subtotal + gst + delivery - discount);
  const totalItems = order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  const address = typeof order.deliveryAddress === 'string'
    ? order.deliveryAddress
    : `${order.deliveryAddress?.address || ''}, ${order.deliveryAddress?.area || ''}, ${order.deliveryAddress?.state || ''} - ${order.deliveryAddress?.pincode || ''}`;

  const mobile = order.deliveryAddress?.mobile || "N/A";

  return (
    <div style={container}>
      <br /><br /><br /><br />

      <div style={header}>
        <span style={backBtn} onClick={() => navigate(-1)}>
          ← Back
        </span>
        <h2 style={title}>Order Details</h2>
        <div style={{ width: 60 }}></div>
      </div>

      <div style={card}>
        {/* Top Section */}
        <div style={headerCard}>
          <div style={headerLeft}>
            <div style={orderId}>Order ID: {order.id}</div>
            <div style={date}>Ordered Date : {new Date(order.createdAt).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}</div>
            {(order.scheduledDate || order.scheduleDate) && (
              <div style={scheduledDate}>
                Expected Delivery: {new Date(order.scheduledDate || order.scheduleDate).toLocaleDateString("en-GB", { weekday: 'short', day: 'numeric', month: 'short' })}
                {order.timeSlot && ` | ${order.timeSlot}`}
              </div>
            )}
          </div>
          <div style={headerRight}>
            <div style={statusBadge}>{order.status}</div>
            <div style={price}>Rs.{total}</div>
          </div>
        </div>

        <div style={divider}></div>

        {/* Items List */}
        <Section title="Order Items">
          {order.items?.map((item, index) => (
            <div key={index} style={itemCard}>
              <img src={getItemImage(item)} alt={item.productName} style={itemImage} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>{item.productName}</div>
                <div style={{ fontSize: 13, color: "#666" }}>Qty: {item.quantity} × Rs.{item.price}</div>
              </div>
              <div style={{ fontWeight: 600 }}>Rs.{item.quantity * item.price}</div>
            </div>
          ))}
        </Section>

        <div style={divider}></div>

        {/* Address */}
        <Section title="Delivery Address">
          <b>{order.customerName}</b>
          <div style={lightText}>{address}</div>
          <div style={{ marginTop: 5 }}>{mobile}</div>
        </Section>

        <div style={divider}></div>

        {/* Payment */}
        <Section title="Payment Details">
          <Row label="Method" value={order.paymentMethod || "N/A"} />
          <Row label="Status" value={order.paymentStatus} />
        </Section>

        <div style={divider}></div>

        <Section title="Price Details">
          <Row label="Items" value={totalItems} />
          {/* <Row label="Distance" value={`${order.distance || 0} km`} /> */}
          <Row label="Subtotal" value={`Rs.${subtotal.toFixed(2)}`} />
          <Row label="GST (5%)" value={`Rs.${gst.toFixed(2)}`} />
          <Row label="Delivery Charge" value={`Rs.${delivery}`} />
          {discount > 0 && (
            <Row label="Discount" value={`- Rs.${discount.toFixed(2)}`} />
          )}
          <div style={totalRow}>
            <span>Total Amount</span>
            <span>Rs.{total.toFixed(2)}</span>
          </div>
        </Section>

        {/* Buttons */}
        <div style={buttonRow}>
{order.status === "Pending" && (
            <button style={cancelBtn} onClick={handleCancelOrder}>Cancel Order</button>
          )}

          <button style={invoiceBtn} onClick={() => generateInvoice(order)}>
            Download Invoice
          </button>
        </div>
      </div>
    </div>
  );
};

/* ================= COMPONENT HELPERS ================= */

const Section = ({ title, children }) => (
  <div style={{ marginBottom: 15 }}>
    <h4 style={sectionTitle}>{title}</h4>
    {children}
  </div>
);

const Row = ({ label, value }) => (
  <div style={row}>
    <span>{label}</span>
    <span style={{ fontWeight: 500 }}>{value}</span>
  </div>
);

/* ================= STYLES ================= */

const container = {
  maxWidth: 750,
  margin: "40px auto",
  padding: 20,
  fontFamily: "Segoe UI, sans-serif",
  minHeight: "100vh",
};

const header = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 30,
  position: "relative",
  // color: "#0e0d0d",
};

const title = {
  margin: 0,
  position: "absolute",
  left: "50%",
  transform: "translateX(-50%)",
};

const backBtn = {
  cursor: "pointer",
  fontWeight: 600,
  color: "#16a34a",
};

const card = {
  background: "#fff",
  padding: 30,
  borderRadius: 20,
  boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
};

const headerCard = {
  background: "linear-gradient(135deg, #CCFFCC 0%, #c8f4c3df 100%)",
  padding: 24,
  borderRadius: 16,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 20,
  boxShadow: "0 4px 12px rgba(60, 184, 21, 0.15)",
};

const headerLeft = {
  display: "flex",
  flexDirection: "column",
  gap: 5,
};

const headerRight = {
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-end",
  gap: 8,
};

const itemCard = {
  display: "flex",
  alignItems: "center",
  gap: 15,
  padding: 15,
  background: "#fff",
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  marginBottom: 10,
  transition: "all 0.2s",
};

const itemImage = {
  width: 60,
  height: 60,
  borderRadius: 8,
  objectFit: "cover",
};

const orderId = {
  fontSize: 17,
  color: "#1f2937",
  fontWeight: 600,
  letterSpacing: "0.5px",
};

const price = {
  fontSize: 28,
  fontWeight: 700,
  color: "#3CB815",
};

const statusBadge = {
  display: "inline-block",
  background: "#fff",
  color: "#3CB815",
  padding: "6px 14px",
  borderRadius: 20,
  fontSize: 12,
  fontWeight: 700,
  border: "2px solid #3CB815",
  letterSpacing: "0.5px",
};

const date = {
  fontSize: 15,
  color: "#666",
  fontWeight: 600,
  marginTop: 2,
};

const scheduledDate = {
  fontSize: 16,
  color: "#666",
  fontWeight: 600,
  marginTop: 2,
};

const sectionTitle = {
  marginBottom: 12,
  fontSize: 16,
  fontWeight: 700,
  color: "#1f2937",
};

const lightText = {
  color: "#555",
  fontSize: 14,
};

const row = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: 6,
  fontSize: 14,
};

const totalRow = {
  display: "flex",
  justifyContent: "space-between",
  marginTop: 12,
  paddingTop: 12,
  borderTop: "2px solid #3CB815",
  fontWeight: 700,
  fontSize: 18,
  color: "#3CB815",
};

const divider = {
  height: 1,
  background: "#eee",
  margin: "20px 0",
};

const buttonRow = {
  display: "flex",
  justifyContent: "flex-end",
  gap: 15,
  marginTop: 20,
};

const cancelBtn = {
  padding: "12px 24px",
  borderRadius: 10,
  border: "none",
  background: "#ef4444",
  color: "#fff",
  cursor: "pointer",
  fontWeight: 600,
  fontSize: 14,
  transition: "all 0.2s",
};

const invoiceBtn = {
  padding: "12px 24px",
  borderRadius: 10,
  border: "none",
  background: "#3CB815",
  color: "#fff",
  cursor: "pointer",
  fontWeight: 600,
  fontSize: 14,
  transition: "all 0.2s",
};

export default OrderDetails;