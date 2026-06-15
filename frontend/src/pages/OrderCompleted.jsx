import React, { useEffect, useState } from "react";
import CommonTable from "../components/CommonTable";
import { BsCheckCircleFill } from "react-icons/bs";
import { FaIndianRupeeSign } from "react-icons/fa6";
import { apiFetch } from "../utils/apiFetch";

const OrderCompleted = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // ===== FETCH DELIVERED ORDERS =====
  useEffect(() => {
    const agentId = localStorage.getItem("userId");

    const fetchOrders = async () => {
      try {
        const res = await apiFetch(`/orders?agentId=${agentId}`, {
          method: "GET",
        });

        const data = await res.json();

        // ✅ SAFE FILTER
        const deliveredOrders = Array.isArray(data)
          ? data.filter((order) => order?.status === "Delivered")
          : [];

        setOrders(deliveredOrders);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // ===== TOTAL EARNING =====
  const totalEarning = orders.reduce(
    (sum, o) => sum + 70,
    0
  );

  // ===== DATE FORMAT =====
  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ===== STATUS STYLE =====
  const statusStyle = {
    padding: "4px 10px",
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 600,
    color: "#065f46",
    background: "#d1fae5",
  };

  // ===== TABLE =====
  const columns = [
    {
      header: "Items",
      Cell: ({ row }) => {
        const items = row.original.items || [];
        return items.length > 0
          ? items.map(i => i.name || i.productName || 'Item').slice(0, 3).join(', ') + (items.length > 3 ? '...' : '')
          : 'No items';
      }
    },

    { accessorKey: "customerName", header: "Customer" },

    {
      header: "Amount",
      Cell: ({ row }) => `Rs. ${row.original.totalAmount}`,
    },

    { accessorKey: "paymentMethod", header: "Payment" },

    {
      header: "Delivered On",
      Cell: ({ row }) =>
        formatDate(
          row.original.deliveredAt ||
          row.original.updatedAt ||
          row.original.createdAt
        ),
    },

    {
      header: "Earning",
      Cell: ({ row }) => "Rs. 70",
    },

    {
      header: "Mobile",
      Cell: ({ row }) =>
        row.original.mobile ||
        row.original.deliveryAddress?.mobile ||
        "N/A",
    },

    {
      header: "Address",
      Cell: ({ row }) =>
        `${row.original.deliveryAddress?.address || ""}, ${row.original.deliveryAddress?.city || ""
        }`,
    },
    
    //     { 
    //   header: "Payment", 
    //   Cell: ({ row }) => {
    //     const method = row.original.paymentMethod || 'COD';
    //     const status = row.original.paymentStatus || 'Pending';
    //     return status === 'Paid' ? `${method} ` : `${method} ⏳`;
    //   }
    // },

    {
      header: "Status",
      Cell: () => <span style={statusStyle}>Delivered</span>,
    },
  ];

  // ===== CARD SUMMARY =====
  const cardData = [
    {
      label: "Completed Orders",
      value: orders.length,
      icon: <BsCheckCircleFill />,
      bg: "#CCFFCC",
      color: "#92400E",
    },
    {
      label: "Total Earnings",
      value: `Rs. ${totalEarning.toFixed(2)}`,
      icon: <FaIndianRupeeSign />,
      bg: "#CCFFCC",
      color: "#92400E",
    },
  ];

  return (
    <div className="container-fluid bg-light py-4" style={{ minHeight: "100vh" }}>
      <br /><br /><br />

      {/* ===== SUMMARY ===== */}
      <div className="d-flex flex-wrap justify-content-center gap-3 my-4">
        {cardData.map((card, idx) => (
          <div key={idx} style={cardStyle(card.bg, card.color)}>
            <div style={iconCircle}>{card.icon}</div>
            <div>
              <h5 className="mb-1" style={{ color: "#163d0a" }}>
                {card.label}
              </h5>
              <h4 className="mb-0" style={{ color: "#4aa031" }}>
                <b>{card.value}</b>
              </h4>
            </div>
          </div>
        ))}
      </div>

      {/* ===== TABLE ===== */}
      <div className="card" style={{ border: "1px solid #e5d3b3", borderRadius: "12px" }}>
        <div className="card-header" style={{ backgroundColor: "#CCFFCC" }}>
          <h4 className="mb-0">
            <b>Completed Orders</b>
          </h4>
        </div>

        <div className="card-body p-0">
          {loading ? (
            <div style={{ padding: "40px", textAlign: "center" }}>Loading...</div>
          ) : (
            <CommonTable columns={columns} data={orders} onDeleteSelected={(rows) => setOrders(prev => prev.filter(o => !rows.find(r => r._id === o._id)))} />
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderCompleted;

/* ===== STYLES ===== */

const cardStyle = (bg, color) => ({
  flex: "1 1 220px",
  display: "flex",
  alignItems: "center",
  background: bg,
  color: color,
  padding: "20px",
  border: "1px solid #e5d3b3",
  borderRadius: "16px",
});

const iconCircle = {
  background: "rgba(0,0,0,0.05)",
  borderRadius: "50%",
  width: 60,
  height: 60,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 26,
  marginRight: 15,
};