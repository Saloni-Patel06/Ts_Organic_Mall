import React, { useState, useEffect } from "react";
import CommonTable from "../../components/CommonTable";
import { FaBoxOpen, FaClock, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { apiFetch } from "../../utils/apiFetch";

const CustomerDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch orders dynamically
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;

    const fetchOrders = async () => {
      try {
        // const res = await fetch(`http://localhost:5000/orders?customerId=${userId}`);
        const res = await apiFetch(`/orders?customerId=${userId}`, {
          method: "GET",
        });
        const data = await res.json();

        // ✅ Ensure orders is always an array
        const ordersArray = Array.isArray(data) ? data : data.orders || [];
        setOrders(ordersArray);

      } catch (err) {
        console.error("Error fetching orders:", err);
        setOrders([]); // fallback to empty array
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);
  // Summary stats
  const totalOrders = Array.isArray(orders) ? orders.length : 0;
  const delivered = Array.isArray(orders) ? orders.filter(o => o.status === "Delivered").length : 0;
  const cancelled = Array.isArray(orders) ? orders.filter(o => o.status === "Cancelled").length : 0;
  const pending = Array.isArray(orders) ? orders.filter(o => o.status !== "Delivered" && o.status !== "Cancelled").length : 0;
  const statusStyle = (status) => ({
    padding: "4px 10px",
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 600,
    color:
      status === "Delivered"
        ? "#065f46"
        : status === "Approved"
          ? "#92400e"
          : status === "Assigned"
            ? "#92400e"
            : status === "Pending"
              ? "#1e40af"
              : status === "Cancelled"
                ? "#dc2626"
                : "#374151",
    background:
      status === "Delivered"
        ? "#d1fae5"
        : status === "Approved"
          ? "#fef3c7"
          : status === "Assigned"
            ? "#fef3c7"
            : status === "Pending"
              ? "#dbeafe"
              : status === "Cancelled"
                ? "#fee2e2"
                : "#f3f4f6",
  });

  const statusBadge = (status) => <span style={statusStyle(status)}>{status}</span>;

  // Table columns
  const columns = [
    {
      accessorKey: "items", header: "Items", Cell: ({ row }) => (
        <div>
          {row.original.items?.map(item => (
            <div key={item.productId}>
              {item.productName} - {item.quantity}
            </div>
          ))}
        </div>
      )
    },
    { accessorKey: "createdAt", header: "Order Date", Cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString() },
    { accessorKey: "scheduledDate", header: "Schedule Date" },
    { accessorKey: "timeSlot", header: "Time Slot" },
    { accessorKey: "totalAmount", header: "Total (Rs.)", Cell: ({ row }) => `Rs.${row.original.totalAmount}` },
    { accessorKey: "status", header: "Status", Cell: ({ row }) => statusBadge(row.original.status) },
  ];

  const cardData = [
    { label: "Total Orders", value: totalOrders, icon: <FaBoxOpen />, bg: "#CCFFCC", color: "#92400e" },
    { label: "Pending Orders", value: pending, icon: <FaClock />, bg: "#fee2e2", color: "#991b1b" },
    { label: "Delivered Orders", value: delivered, icon: <FaCheckCircle />, bg: "#CCFFCC", color: "#92400e" },
    { label: "Cancelled Orders", value: cancelled, icon: <FaTimesCircle />, bg: "#fee2e2", color: "#991b1b" }
  ];

  return (
    <div className="container-fluid bg-light py-4" style={{ minHeight: "100vh", width: "100%" }}>
      <br /><br /><br />

      {/* ===== SUMMARY CARDS ===== */}
      <div className="d-flex flex-wrap justify-content-center gap-3 my-4">
        {cardData.map((card, idx) => (
          <div key={idx} style={{
            flex: "1 1 200px",
            display: "flex",
            alignItems: "center",
            background: card.bg,
            color: card.color,
            padding: "20px",
            border: "1px solid #e5d3b3",
            borderRadius: "16px"
          }}>
            <div style={{
              background: "rgba(0,0,0,0.05)",
              borderRadius: "50%",
              width: 60,
              height: 60,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              marginRight: 15
            }}>
              {card.icon}
            </div>
            <div>
              <h5 style={{
                color: card.label === "Pending Orders" ||card.label === "Cancelled Orders"? "#991b1b" : "#163d0a"
              }}>
                {card.label}
              </h5>

              <h4>
                <b style={{
                  color: card.label === "Pending Orders" ||card.label ==="Cancelled Orders"? "#991b1b" : "#4aa031"
                }}>
                  {card.value}
                </b>
              </h4>
              {/* <h5 className="mb-1" style={{ color: "#163d0a" }}>{card.label}</h5>
              <h4 className="mb-0" style={{ color: "#4aa031" }}><b>{card.value}</b></h4> */}
            </div>
          </div>
        ))}
      </div>

      {/* ===== ORDERS TABLE ===== */}
      <div className="card" style={{ border: "1px solid #e5d3b3", borderRadius: "12px" }}>
        <div
          className="card-header"
          style={{
            backgroundColor: "#CCFFCC",
            borderBottom: "1px solid #e5d3b3",
            borderRadius: "12px 12px 0 0"
          }}
        >
          <h4 className="mb-0" style={{ color: "#4b2e05" }}>
            <b>Recent Orders</b>
          </h4>
        </div>

        <div className="card-body p-0">
          {loading ? (
            <div style={{ padding: "40px", textAlign: "center", color: "#777" }}>Loading...</div>
          ) : (
            <CommonTable columns={columns} data={orders} onDeleteSelected={async (rows) => { for (const r of rows) await apiFetch(`/orders/${r._id}`, { method: "DELETE" }); setOrders(prev => prev.filter(o => !rows.find(r => r._id === o._id))); }} />
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;