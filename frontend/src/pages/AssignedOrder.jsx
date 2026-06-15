import React, { useState, useEffect } from "react";
import CommonTable from "../components/CommonTable";
import { MdDeliveryDining } from "react-icons/md";
import { BsCheckCircleFill } from "react-icons/bs";
import { apiFetch } from "../utils/apiFetch";
import { useToast } from "../Context/ToastContext";

const AssignedOrders = () => {
  const { showToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [failReason, setFailReason] = useState("");
  const [deliveryOtpInput, setDeliveryOtpInput] = useState("");


  useEffect(() => {
    const agentId = localStorage.getItem("userId");

    const fetchOrders = async () => {
      const res = await apiFetch(`/orders?agentId=${agentId}`, { method: "GET" });
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    };

    if (agentId) fetchOrders();
  }, []);

  // ================= STATUS UPDATE =================
  const updateStatus = async (id, newStatus) => {
    const wasFailed = newStatus === "Failed";
    const reasonToSend = wasFailed ? failReason : "";

    try {
      const body = newStatus === "Reject"
        ? { status: "Pending", agentId: null, agentName: null }
        : { status: newStatus, failReason: reasonToSend };

      await apiFetch(`/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      const agentId = localStorage.getItem("userId");
      const res = await apiFetch(`/orders?agentId=${agentId}`);
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
      setFailReason("");
      setDeliveryOtpInput("");

    } catch (error) {
      console.error("Update error:", error);
      showToast("Status update failed", "error");
    }
  };

  const generateDeliveryOtp = async (id) => {
    try {
      await apiFetch(`/orders/${id}/generate-delivery-otp`, { method: "PUT" });
      showToast("Delivery OTP sent to customer!", "success");
      const agentId = localStorage.getItem("userId");
      const res = await apiFetch(`/orders?agentId=${agentId}`);
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      showToast("OTP generation failed", "error");
    }
  };

  const verifyDeliveryOtp = async (id, otp) => {
    if (!otp.trim()) {
      showToast("Enter customer OTP", "error");
      return;
    }
    try {
      await apiFetch(`/orders/${id}/verify-delivery-otp`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp })
      });
      showToast("Delivery confirmed! ₹70 credited", "success");
      const agentId = localStorage.getItem("userId");
      const res = await apiFetch(`/orders?agentId=${agentId}`);
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
      setDeliveryOtpInput("");
    } catch (error) {
      showToast("OTP verification failed", "error");
    }
  };

  // ================= BUTTON FLOW =================
  const getAvailableActions = (status, order) => {
    switch (status) {
      case "Assigned": return ["Accept", "Reject"];
      case "Accept": return ["Picked Up"];
      case "Picked Up": return ["Out for Delivery"];
      case "Out for Delivery": 
        return order.deliveryOtp ? ["Verify OTP", "Failed"] : ["Generate OTP", "Failed"];
      default: return [];
    }
  };

  const getButtonLabel = (status) => {
    switch (status) {
      case "Accept": return "✅ Accept";
      case "Reject": return "❌ Reject";
      case "Picked Up": return "📦 Picked Up";
      case "Out for Delivery": return "🚚 Out for Delivery";
      case "Delivered": return "✅ Delivered";
      default: return status;
    }
  };

  // ================= STATUS STYLE =================
  // CSS classes now used

  // ================= SUMMARY =================
  const totalOrders = orders.length;

  const activeOrders = Array.isArray(orders) ? orders.filter(o => o.status !== "Delivered").length : 0;
  const deliveredOrders = Array.isArray(orders) ? orders.filter(o => o.status === "Delivered").length : 0;


  // ================= TABLE =================
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
      header: "Delivery Date",
      Cell: ({ row }) => row.original.scheduledDate
    },

    {
      header: "Time Slot",
      Cell: ({ row }) => row.original.timeSlot
    },

    {
      header: "Amount",
      Cell: ({ row }) => `Rs.${row.original.totalAmount}`
    },

    { accessorKey: "paymentMethod", header: "Payment" },

    {
      header: "Mobile",
      accessorKey: "mobile",
      size: 130,
      minSize: 110,
      Cell: ({ row }) => {
        const mobile = row.original.deliveryAddress?.mobile;
        return mobile ? ` ${mobile}` : " N/A";
      }
    },

    {
      header: "Address",
      Cell: ({ row }) =>
        `${row.original.deliveryAddress?.address}, ${row.original.deliveryAddress?.city}`
    },
    
    // { 
    //   header: "Payment", 
    //   Cell: ({ row }) => {
    //     const status = row.original.paymentStatus || 'Pending';
    //     return status === 'Paid' ? `${method} ` : `${method} ⏳`;
    //   }
    // },

    {
      header: "Status",
      Cell: ({ row }) => (

        <span className={`status status-${(row.original.status || '').toLowerCase().replace(/ /g, '-')}`}>
          {row.original.status || 'N/A'}
        </span>

      ),
    },

    {
      header: "Actions",
      Cell: ({ row }) => {

        const order = row.original;
        const actions = getAvailableActions(order.status, order);

        return (
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {actions.length > 0 ? (
              actions.map((nextStatus) => (
                nextStatus === "Failed" ? (
                  <div key="failed">
                    <input
                      type="text"
                      placeholder="Reason"
                      value={failReason}
                      onChange={(e) => setFailReason(e.target.value)}
                      style={{ padding: 4, borderRadius: 4, border: "1px solid #ccc", width: 90, marginBottom: 4 }}
                    />
                    <button
                      onClick={() => {
                        if (!failReason.trim()) { showToast("Enter failure reason", "error"); return; }
                        updateStatus(order._id, "Failed");
                      }}
                      style={{ ...actionBtn, background: "#ef4444" }}
                    >
                      ❌ Failed
                    </button>
                  </div>
                ) : nextStatus === "Generate OTP" ? (
                  <button
                    key={nextStatus}
                    onClick={() => generateDeliveryOtp(order._id)}
                    style={{ ...actionBtn, background: "#3b82f6" }}
                  >
                    📧 Generate OTP
                  </button>
                ) : nextStatus === "Verify OTP" ? (
                  <div key="otp-input" style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                    <input
                      type="text"
                      maxLength="4"
                      placeholder="OTP"
                      value={deliveryOtpInput}
                      onChange={(e) => setDeliveryOtpInput(e.target.value.toUpperCase())}
                      style={{ 
                        padding: "4px 8px", 
                        borderRadius: 4, 
                        border: "1px solid #ccc", 
                        width: 60,
                        textAlign: "center",
                        fontWeight: "bold",
                        fontSize: 16,
                        letterSpacing: 2,
                        textTransform: "uppercase"
                      }}
                    />
                    <button
                      onClick={() => verifyDeliveryOtp(order._id, deliveryOtpInput)}
                      style={{ ...actionBtn, background: "#10b981", fontSize: 12, padding: "4px 8px" }}
                    >
                      ✅ Verify
                    </button>
                  </div>
                ) : (
                  <button
                    key={nextStatus}
                    onClick={() => updateStatus(order._id, nextStatus)}
                    style={{ ...actionBtn, background: nextStatus === "Reject" ? "#ef4444" : "#3CB815" }}
                  >
                    {getButtonLabel(nextStatus)}
                  </button>
                )
              ))
            ) : (
              <span style={{ fontSize: 12, color: "#777" }}>No Action</span>
            )}
          </div>
        );
      }
    }
  ];

  const cardData = [
    {
      label: "Total Orders",
      value: totalOrders,
      icon: <MdDeliveryDining />,
      bg: "#CCFFCC",
      color: "#92400E",
    },
    {
      label: "Active Orders",
      value: activeOrders,
      icon: <MdDeliveryDining />,
      bg: "#CCFFCC",
      color: "#92400E",
    },
    {
      label: "Delivered",
      value: deliveredOrders,
      icon: <BsCheckCircleFill />,
      bg: "#CCFFCC",
      color: "#92400E",
    },
  ];

  return (
    <div className="container-fluid bg-light py-4" style={{ minHeight: "100vh" }}>

      <br /><br /><br />

      {/* SUMMARY */}
      <div className="d-flex flex-wrap justify-content-center gap-3 my-4">
        {cardData.map((card, idx) => (
          <div key={idx} style={cardStyle(card.bg, card.color)}>
            <div style={iconCircle}>{card.icon}</div>
            <div>
              <h5 className="mb-1" style={{ color: "#163d0a" }}>{card.label}</h5>
              <h4 className="mb-0" style={{ color: "#4aa031" }}>
                <b>{card.value}</b>
              </h4>
            </div>
          </div>
        ))}
      </div>

      {/* TABLE */}
      <div className="card" style={{ border: "1px solid #e5d3b3", borderRadius: "12px" }}>
        <div className="card-header" style={{ backgroundColor: "#CCFFCC" }}>
          <h4 className="mb-0"><b>Assigned Orders</b></h4>
        </div>

        <div className="card-body p-0">
          <CommonTable columns={columns} data={orders} onDeleteSelected={async (rows) => { for (const r of rows) await apiFetch(`/orders/${r._id}`, { method: "DELETE" }); const agentId = localStorage.getItem("userId"); const res = await apiFetch(`/orders?agentId=${agentId}`); const data = await res.json(); setOrders(Array.isArray(data) ? data : []); }} />
        </div>
      </div>

    </div>
  );
};

export default AssignedOrders;


/* ================= STYLES ================= */

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

const actionBtn = {
  padding: "5px 12px",
  border: "none",
  borderRadius: 6,
  background: "#3CB815",
  color: "#fff",
  cursor: "pointer",
};