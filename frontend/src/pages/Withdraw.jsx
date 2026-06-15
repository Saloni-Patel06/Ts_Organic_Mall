import React, { useEffect, useState } from "react";
import CommonTable from "../components/CommonTable";
import { FaWallet, FaClock, FaArrowUp } from "react-icons/fa";
// import { MdAccountBalanceWallet } from "react-icons/md";
import { apiFetch } from "../utils/apiFetch";

const Withdraw = () => {
  const [wallet, setWallet] = useState(null);
  const [withdrawHistory, setWithdrawHistory] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [formData, setFormData] = useState({ amount: "", bankDetails: "", description: "" });

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const agentId = localStorage.getItem("userId");
        if (!agentId) return;

        // Fetch wallet
        const res = await apiFetch(`/wallets/agent/${agentId}`);
        const data = await res.json();
        if (data.success) {
          setWallet(data.data);

          // Fetch and sort Withdraw History (newest first)
          const withdrawRes = await apiFetch(`/withdraw?agentId=${data.data._id}`);
          const withdrawData = await withdrawRes.json();
          if (withdrawData.success) {
            const sortedHistory = withdrawData.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setWithdrawHistory(sortedHistory);
          }
        }
      } catch (error) {
        console.error("Wallet fetch error:", error);
      }
    };
    fetchWallet();
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const amount = Number(formData.amount);
    if (amount <= 0) { alert("Enter valid amount"); return; }
    if (amount > (wallet?.balance || 0)) { alert("Insufficient Balance ❌"); return; }

    try {
      await apiFetch("/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId: wallet._id, ...formData, amount }),
      });
      setShowPopup(false);
      setFormData({ amount: "", bankDetails: "", description: "" });

      // Refresh wallet & history
      const res = await apiFetch(`/wallets/agent/${wallet._id}`);
      const data = await res.json();
      if (data.success) setWallet(data.data);

      const withdrawRes = await apiFetch(`/withdraw?agentId=${wallet._id}`);
      const withdrawData = await withdrawRes.json();
      if (withdrawData.success) {
        const sortedHistory = withdrawData.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setWithdrawHistory(sortedHistory);
      }

    } catch (error) {
      console.error("Withdraw error:", error);
    }
  };

  const statusStyle = (status) => ({
    padding: "3px 10px", borderRadius: 6, fontSize: 12, fontWeight: 600,
    background: status === "Approved" ? "#d1fae5" : status === "Rejected" ? "#fee2e2" : "#fef3c7",
    color: status === "Approved" ? "#065f46" : status === "Rejected" ? "#991b1b" : "#92400e"
  });

  const columns = [
    { header: "Date", Cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString("en-GB") },
    { header: "Amount", Cell: ({ row }) => `₹${row.original.amount}` },
    { header: "UPI", Cell: ({ row }) => row.original.bankDetails },
    { header: "Status", Cell: ({ row }) => <span style={statusStyle(row.original.status)}>{row.original.status}</span> },
  ];

  const cardData = wallet ? [
    { label: "Available Balance", value: `₹${wallet.balance || 0}`, icon: <FaWallet /> },
    { label: "Pending Withdraw", value: `₹${wallet.pending || 0}`, icon: <FaClock />, bg: "#fee2e2", color: "#991b1b" },
    { label: "Total Withdrawn", value: `₹${wallet.withdrawn || 0}`, icon: <FaArrowUp /> },
  ] : [];

  return (
    <div className="container-fluid bg-light py-4" style={{ minHeight: "100vh" }}>
      <br /><br /><br />
      {!wallet ? (
        <p className="p-3 text-danger">Wallet not found.</p>
      ) : (
        <>
          {/* ===== Cards ===== */}
          <div className="d-flex flex-wrap justify-content-center gap-3 my-4">
            {cardData.map((card, idx) => (
              <div key={idx} style={{
                flex: "1 1 200px", display: "flex", alignItems: "center",
                background: card.bg || "#CCFFCC", padding: "20px", borderRadius: "16px", border: "1px solid #e5d3b3"
              }}>
                <div style={{
                  background: "rgba(0,0,0,0.05)", borderRadius: "50%", width: 60, height: 60,
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, marginRight: 15
                }}>{card.icon}</div>
                <div>
                  <h5 style={{ color: card.color || "#163d0a" }}>{card.label}</h5>
                  <h4><b style={{ color: card.color || "#4aa031" }}>{card.value}</b></h4>
                </div>
              </div>
            ))}
          </div>

          {/* ===== Withdrawal History ===== */}
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center" style={{ backgroundColor: "#CCFFCC" }}>
              <h4><b>Withdrawal History</b></h4>
              <button
                style={{ background: "#3CB815", color: "#fff", border: "none", borderRadius: 10, padding: "8px 20px", cursor: "pointer" }}
                onClick={() => { if (wallet.balance <= 0) { alert("Insufficient Balance ❌"); return; } setShowPopup(true); }}
              >
                Withdraw Amount
              </button>
            </div>
            <div className="card-body p-0">
              <CommonTable
                columns={columns}
                data={withdrawHistory}
                onDeleteSelected={async (rows) => {
                  for (const r of rows) await apiFetch(`/withdraw/${r._id}`, { method: "DELETE" });
                  const withdrawRes = await apiFetch(`/withdraw?agentId=${wallet._id}`);
                  const withdrawData = await withdrawRes.json();
                  if (withdrawData.success) {
                    const sortedHistory = withdrawData.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                    setWithdrawHistory(sortedHistory);
                  }
                }}
              />
            </div>
          </div>

          {/* ===== Withdraw Popup ===== */}
          {showPopup && (
            <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100vh", background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999 }}>
              <div style={{ background: "#fff", borderRadius: 16, padding: 28, width: 400, maxWidth: "95vw" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <div style={{ fontSize: 17, fontWeight: 800, color: "#1a1a1a" }}>💸 Withdraw Request</div>
                  <button onClick={() => setShowPopup(false)} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#888" }}>✕</button>
                </div>
                <div style={{ background: "#e8f5e9", borderRadius: 10, padding: "10px 16px", marginBottom: 20, display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 13, color: "#555" }}>Available Balance</span>
                  <span style={{ fontWeight: 800, color: "#3CB815" }}>₹{wallet.balance}</span>
                </div>
                <form onSubmit={handleSubmit}>
                  <div style={{ marginBottom: 14 }}>
                    <label>Amount (₹)</label>
                    <input type="number" name="amount" placeholder="Enter amount" value={formData.amount} onChange={handleChange} required min="1" max={wallet.balance} style={{ width: "100%", padding: "9px 12px", fontSize: 14, borderRadius: 8, border: "1.5px solid #e0e0e0" }} />
                  </div>
                  <div style={{ marginBottom: 14 }}>
                    <label>UPI ID</label>
                    <input type="text" name="bankDetails" placeholder="UPI ID" value={formData.bankDetails} onChange={handleChange} required style={{ width: "100%", padding: "9px 12px", fontSize: 14, borderRadius: 8, border: "1.5px solid #e0e0e0" }} />
                  </div>
                  <div style={{ marginBottom: 20 }}>
                    <label>Note (optional)</label>
                    <textarea name="description" placeholder="Add a note..." value={formData.description} onChange={handleChange} style={{ width: "100%", padding: "9px 12px", fontSize: 14, borderRadius: 8, border: "1.5px solid #e0e0e0", resize: "none" }} rows={2} />
                  </div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button type="submit" style={{ background: "#3CB815", color: "#fff", border: "none", borderRadius: 10, padding: "6px 28px", cursor: "pointer", flex: 1 }}>Submit Request</button>
                    <button type="button" onClick={() => setShowPopup(false)} style={{ background: "#f3f3f7", color: "#555", border: "1.5px solid #e0e0e0", borderRadius: 10, padding: "12px 28px", flex: 1 }}>Cancel</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Withdraw;