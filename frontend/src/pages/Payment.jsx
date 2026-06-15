import React, { useState, useEffect } from "react";
import CommonTable from "../components/CommonTable";
import { FaMoneyBillWave, FaRupeeSign, FaUndo } from "react-icons/fa";
import { apiFetch } from "../utils/apiFetch";

const Payment = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const response = await apiFetch("/payments");
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const { data } = await response.json();

      setPayments(data.map(p => ({
        id: p._id,
        transactionId: p.razorpayPaymentId || p._id,
        product: p.product || "N/A",
        customer: p.customerName || "Customer",
        date: new Date(p.createdAt).toLocaleDateString(),
        amount: p.amount || 0,
        method: p.paymentMethod || "Razorpay",
        status: p.refundStatus === "Completed" ? "Refunded" : (p.paymentStatus || "Paid"),
        refundAmount: p.refundAmount || 0,
        adminFee: p.adminFee || 0
      })));

    } catch (err) {
      console.error("Payment fetch error:", err);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPayments(); }, []);

  const deletePayments = async (rows) => {
    for (const row of rows) {
      await apiFetch(`/payments/${row.id}`, { method: "DELETE" });
    }
    fetchPayments();
  };

  // ===== CALCULATIONS =====
  const totalTransactions = payments.length;

  const totalRevenue = payments.reduce(
    (sum, p) => sum + Number(p.amount || 0),
    0
  ).toFixed(2);

  const totalRefunded = payments.reduce(
    (sum, p) => sum + Number(p.refundAmount || 0),
    0
  ).toFixed(2);

  const totalAdminFee = payments.reduce(
    (sum, p) => sum + Number(p.adminFee || 0),
    0
  ).toFixed(2);

  const refundedOrders = payments.filter(
    p => p.status === "Refunded"
  ).length;

  // ===== STATUS STYLE =====
  const getStatusStyle = (status) => {
    if (status.toLowerCase() === "refunded") {
      return {
        padding: "2px 8px",
        borderRadius: 4,
        fontSize: 11,
        fontWeight: 600,
        color: "#dc2626",
        background: "#fee2e2"
      };
    }
    return {
      padding: "2px 8px",
      borderRadius: 4,
      fontSize: 11,
      fontWeight: 600,
      color: "#065f46",
      background: "#d1fae5"
    };
  };

  // ===== TABLE =====
  const columns = [
    { accessorKey: "transactionId", header: "Transaction ID" },
    { accessorKey: "product", header: "Product" },
    { accessorKey: "customer", header: "Customer" },
    { accessorKey: "date", header: "Date" },
    { accessorKey: "amount", header: "Amount (Rs.)", Cell: ({ cell }) => `Rs.${cell.getValue()}` },
    { accessorKey: "method", header: "Payment Method" },
    { accessorKey: "status", header: "Status", Cell: ({ cell }) => <span style={getStatusStyle(cell.getValue())}>{cell.getValue()}</span> },
    { accessorKey: "refundAmount", header: "Refund (Rs.)", Cell: ({ cell }) => `Rs.${cell.getValue()}` },
  ];

  // ===== CARDS (AGENTS STYLE) =====
  const cardData = [
    {
      label: "Total Transactions",
      value: totalTransactions,
      icon: <FaMoneyBillWave />,
      bg: "#CCFFCC"
    },
    {
      label: "Total Revenue",
      value: `₹${totalRevenue}`,
      icon: <FaRupeeSign />,
      bg: "#CCFFCC"
    },
    {
      label: "Admin Earnings",
      value: `₹${totalAdminFee}`,
      icon: <FaRupeeSign />,
      bg: "#CCFFCC"
    },
    {
      label: "Refunded Amount",
      value: `₹${totalRefunded}`,
      icon: <FaUndo />,
      bg: "#fee2e2"
    },
    {
      label: "Refund Orders",
      value: refundedOrders,
      icon: <FaUndo />,
      bg: "#fee2e2"
    },
  ];

  if (loading) return (
    <div className="container-fluid bg-light py-4" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="spinner-border text-success" />
      <span className="ms-3">Loading payments...</span>
    </div>
  );

  return (
    <div className="container-fluid bg-light py-4" style={{ minHeight: "100vh" }}>
      <br /><br /><br />

      <div className="d-flex flex-wrap justify-content-center gap-3 my-4">
        {cardData.map((card, idx) => (
          <div key={idx} style={{
            flex: "1 1 200px", display: "flex", alignItems: "center",
            background: card.bg, padding: "20px", border: "1px solid #e5d3b3", borderRadius: "16px"
          }}>
            <div style={{
              background: "rgba(0,0,0,0.05)", borderRadius: "50%", width: 60, height: 60,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, marginRight: 15
            }}>{card.icon}</div>
            <div>
              <h5 style={{
                    color: card.label === "Pending Withdraw" ? "#991b1b" : "#163d0a"
                  }}>
                    {card.label}
                  </h5>

                  <h4>
                    <b style={{
                      color: card.label === "Pending Withdraw" ? "#991b1b" : "#4aa031"
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

      {/* ===== TABLE ===== */}
      <div className="card">
        <div className="card-header" style={{ backgroundColor: "#CCFFCC" }}>
          <h4><b>Transactions</b></h4>
        </div>

        <div className="card-body p-0">
          <CommonTable
            columns={columns}
            data={payments}
            onDeleteSelected={deletePayments}
          />
        </div>
      </div>
    </div>
  );
};

export default Payment;