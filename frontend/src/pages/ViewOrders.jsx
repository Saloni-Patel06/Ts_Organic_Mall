import React, { useMemo, useState, useEffect, useCallback } from "react";
import CommonTable from "../components/CommonTable";
import { apiFetch } from "../utils/apiFetch";

const ViewOrders = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orders, setOrders] = useState([]);
  const [agents, setAgents] = useState([]);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await apiFetch("/orders", { method: "GET" });
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const res = await apiFetch("/agents", { method: "GET" });
        const data = await res.json();
        setAgents(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching agents:", error);
      }
    };
    fetchAgents();
  }, []);

  const assignAgent = useCallback(async (orderId, agent) => {
    await apiFetch(`/orders/${orderId}/assign-agent`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ agentId: agent.id, agentName: agent.name, mobile: agent.mobile }),
    });
    fetchOrders();
  }, [fetchOrders]);

  const deleteOrders = async (rows) => {
    for (const row of rows) {
      await apiFetch(`/orders/${row._id}`, { method: "DELETE" });
    }
    fetchOrders();
  };

  const columns = useMemo(() => [

    {
      header: "Items",
      Cell: ({ row }) => {
        const items = row.original.items || [];
        return items.length > 0
          ? items.map(i => i.productName || i.name || 'Item').slice(0, 3).join(', ') + (items.length > 3 ? '...' : '')
          : 'No items';
      }
    },
    {
      header: "Order Date",
      Cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString("en-GB"),
    },
    { accessorKey: "customerName", header: "Customer Name" },
    // {
    //   header: "Delivery Agent",
    //   Cell: ({ row }) => {
    //     const status = row.original.status || "";
    //     return status === "Cancelled" ? "—" : (row.original.agentName || "Not Assigned");
    //   },
    // },

    {
      header: "Total (Rs.)",
      Cell: ({ row }) => `Rs.${row.original.totalAmount}`,
    },
    { accessorKey: "paymentMethod", header: "Payment" },

    // {
    //   header: "Delivery Status",
    //   Cell: ({ row }) => {
    //     const status = row.original.status || "";
    //     const statusClass = `status-${status.toLowerCase().replace(/ /g, "-")}`;
    //     return <span className={`status ${statusClass}`}>{status || "—"}</span>;
    //   },
    // },
    {
      header: "Assign Agent",
      Cell: ({ row }) => {
        const status = row.original.status || "";
        const isCompleted = ["Delivered", "Cancelled"].includes(status) || row.original.agentName;

        if (isCompleted) {
          return status === "Cancelled" ? "—" : (row.original.agentName || "Not Assigned");
        }

        return (
          <select
            className="form-select form-select-sm"
            style={{ width: "140px" }}
            defaultValue=""
            onChange={(e) => {
              if (!e.target.value) return;
              assignAgent(row.original._id, JSON.parse(e.target.value));
            }}
          >
            <option value="">Select Agent</option>
            {agents.map(a => (
              <option key={a._id} value={JSON.stringify(a)}>{a.name}</option>
            ))}
          </select>
        );
      },
    },

    {
      header: "Delivery Status",
      Cell: ({ row }) => {
        const status = row.original.status || "";
        const statusClass = `status-${status.toLowerCase().replace(/ /g, "-")}`;
        return <span className={`status ${statusClass}`}>{status || "—"}</span>;
      },
    },

    {
      header: "Action",
      Cell: ({ row }) => (
        <button className="btn btn-sm btn-outline-primary" onClick={() => { setSelectedOrder(row.original); setShowPopup(true); }}>
          View
        </button>
      ),
    },
  ], [agents, assignAgent]);

  return (
    <div className="container-fluid bg-light py-4" style={{ minHeight: "100vh" }}>
      <br /><br /><br /><br />

      <div className="card" style={{ border: "1px solid #e5d3b3", borderRadius: "12px" }}>
        <div className="card-header" style={{ backgroundColor: "#CCFFCC", borderBottom: "1px solid #e5d3b3" }}>
          <h4 className="mb-0"><b>View Orders</b></h4>
        </div>
        <div className="card-body p-0">
          <CommonTable columns={columns} data={orders} onDeleteSelected={deleteOrders} />
        </div>
      </div>

      {showPopup && selectedOrder && (
        <div style={styles.overlay}>
          <div style={styles.popup}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0"><b>Order Details</b></h5>
              <button style={styles.closeX} onClick={() => setShowPopup(false)}>✖</button>
            </div>
            <hr />

            <div style={styles.grid}>
              <p className="mb-1"><b>Order ID:</b> {selectedOrder._id}</p>
              <p className="mb-1"><b>Date:</b> {new Date(selectedOrder.createdAt).toLocaleDateString("en-GB")}</p>
              <p className="mb-1"><b>Customer:</b> {selectedOrder.customerName}</p>
              <p className="mb-1"><b>Delivery Agent:</b> {selectedOrder.agentName || "Not Assigned"}</p>
              <p className="mb-1"><b>Scheduled Date:</b> {selectedOrder.scheduledDate || "N/A"}</p>
              <p className="mb-1"><b>Time Slot:</b> {selectedOrder.timeSlot || "N/A"}</p>
              <p className="mb-1"><b>Payment:</b> <span style={{ color: "green", fontWeight: "bold" }}>{selectedOrder.paymentStatus}</span></p>
              <p className="mb-1"><b>Delivery Status:</b> {selectedOrder.status || "—"}</p>
            </div>

            <h6 className="mt-3"><b>Items</b></h6>
            <table className="table table-bordered table-sm">
              <thead className="table-light">
                <tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr>
              </thead>
              <tbody>
                {selectedOrder.items?.map((item, i) => (
                  <tr key={i}>
                    <td>{item.productName}</td>
                    <td>{item.quantity}</td>
                    <td>Rs.{item.price}</td>
                    <td>Rs.{item.quantity * item.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h6 className="text-end"><b>Grand Total: Rs.{selectedOrder.totalAmount}</b></h6>

            <div className="text-end mt-2">
              <button style={styles.closeBtn} onClick={() => setShowPopup(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewOrders;

const styles = {
  overlay: {
    position: "fixed", top: 0, left: 0, width: "100%", height: "100vh",
    background: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "center",
    alignItems: "center", zIndex: 9999,
  },
  popup: {
    background: "#fff", padding: "30px", borderRadius: "12px",
    width: "750px", maxHeight: "85vh", overflowY: "auto",
  },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2px" },
  closeX: {
    border: "none", background: "red", color: "#fff",
    padding: "5px 10px", borderRadius: "6px", cursor: "pointer",
  },
  closeBtn: {
    padding: "8px 20px", border: "none", background: "red",
    color: "#fff", borderRadius: "6px", cursor: "pointer",
  },
};