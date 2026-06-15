import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../utils/apiFetch";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [cancellingOrderId, setCancellingOrderId] = useState(null);
  const navigate = useNavigate();

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order? 80% will be refunded to your wallet.")) return;

    setCancellingOrderId(orderId);
    try {
      const response = await apiFetch(`/orders/${orderId}/cancel`, { method: "PUT" });
      if (!response.ok) throw new Error("Cancel failed");
      // Refresh orders
      window.location.reload();
    } catch (error) {
      alert("Cancel failed: " + error.message);
    } finally {
      setCancellingOrderId(null);
    }
  };

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const role = localStorage.getItem("role");

    if (!isLoggedIn || role !== "customer") {
      navigate("/login");
      return;
    }

    const fetchOrders = async () => {
      try {
        // ✅ IMPORTANT: backend already filters by logged-in user
        const response = await apiFetch("/orders");

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        console.log("Orders API:", data);

        setOrders(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching orders:", error);
        setOrders([]);
      }
    };

    fetchOrders();
  }, [navigate]);

  const getProductImage = (order) => {
    if (order.items?.[0]?.img) return order.items[0].img;
    if (order.items?.[0]?.productImage) return order.items[0].productImage;
    return "/img/default.png";
  };

  return (
    <div style={container}>
      <br /><br /><br />
      <h2 style={title}>My Orders</h2>

      {orders.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#999" }}>
          <h5>No orders found</h5>
        </div>
      ) : (
        orders.map((order) => {
          const orderId = order?._id || order?.id;

          return (
            <div
              key={orderId}
              style={card}
              onClick={() => navigate(`/order-details/${orderId}`)}
            >
              <img src={getProductImage(order)} alt="" style={image} />

              <div style={{ flex: 1 }}>
                <div style={orderIdStyle}>Order ID: {orderId}</div>

                <div style={statusText(order.status)}>
                  {order.status || "Pending"}
                </div>

                <div style={dateText}>
                  {order.createdAt
                    ? new Date(order.createdAt).toLocaleDateString("en-GB", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                      })
                    : "N/A"}
                </div>

                <div style={meta}>
                  Items: {order.items?.length || 0}
                </div>
              </div>

              <div style={arrow}>›</div>
              {order.status === "Pending" && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCancelOrder(orderId);
                  }}
                  disabled={cancellingOrderId === orderId}
                  style={{
                    background: "#dc2626",
                    color: "white",
                    border: "none",
                    padding: "6px 12px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "13px",
                    marginLeft: "10px"
                  }}
                >
                  {cancellingOrderId === orderId ? "Cancelling..." : "Cancel"}
                </button>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

/* ================= STYLES ================= */

const container = {
  maxWidth: 800,
  margin: "40px auto",
  padding: 20,
  fontFamily: "Segoe UI, sans-serif",
};

const title = {
  marginBottom: 25,
  fontSize: 26,
  fontWeight: 700,
};

const card = {
  display: "flex",
  gap: 15,
  padding: 15,
  marginBottom: 15,
  background: "#fff",
  borderRadius: 14,
  boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
  alignItems: "center",
  cursor: "pointer",
};

const image = {
  width: 85,
  height: 85,
  borderRadius: 12,
  objectFit: "cover",
};

const orderIdStyle = {
  fontSize: 13,
  color: "#777",
  marginBottom: 4,
};

const statusText = (status) => ({
  fontWeight: 600,
  fontSize: 15,
  color: status === "Cancelled" ? "#dc2626" : "#111",
  marginBottom: 4,
});

const dateText = {
  fontSize: 13,
  color: "#555",
};

const meta = {
  fontSize: 13,
  color: "#444",
  marginTop: 6,
};

const arrow = {
  fontSize: 24,
  color: "#bbb",
};

export default Orders;