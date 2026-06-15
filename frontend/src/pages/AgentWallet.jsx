import React, { useEffect, useState, useMemo } from "react";
import { Button } from '@mantine/core';
import CommonTable from "../components/CommonTable";
import { FaWallet, FaMoneyBillWave, FaClock, FaUsers } from "react-icons/fa";
import { apiFetch } from "../utils/apiFetch";

const AgentWallet = () => {
  const [popup, setPopup] = useState(null);
  const [withdrawRequests, setWithdrawRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [agents, setAgents] = useState([]);

  // Filter function to exclude refund-related agents from grid
  const hasRefundTransaction = (transactions) => {
    if (!transactions || transactions.length === 0) return false;
    return transactions.some(t => 
      t.description?.toLowerCase().includes('refund') ||
      t.description?.toLowerCase().includes('cancel refund') ||
      t.amount < 0
    );
  };

  useEffect(() => {
    const fetchWallets = async () => {
      try {
        setLoading(true);
        const res = await apiFetch("/wallets", { method: "GET" });
        const data = await res.json();
        if (data.success) {
          // Filter out refund-related agents from grid
          const filteredAgents = data.data
            .filter(w => !hasRefundTransaction(w.transactions))
            .map((w) => ({
              id: w._id,
              agentId: w.agentId,
              name: w.name,
              mobile: w.mobile,
              totalEarnings: Number(w.totalEarnings) || 0,
              balance: Number(w.balance) || 0,
              withdrawn: Number(w.withdrawn) || 0,
              pending: Number(w.pending) || 0,
              transactions: w.transactions || [],
            }));
          setAgents(filteredAgents);
        }
      } catch (error) {
        console.error("Wallet fetch error:", error);
      }
      setLoading(false);
    };
    fetchWallets();
  }, []);

  const totalEarnings = useMemo(() => agents.reduce((s, a) => s + a.totalEarnings, 0), [agents]);
  const totalWithdrawn = useMemo(() => agents.reduce((s, a) => s + a.withdrawn, 0), [agents]);
  const totalPending = useMemo(() => agents.reduce((s, a) => s + a.pending, 0), [agents]);

  const handleView = async (row) => {
    setPopup(row);
    try {
      const res = await apiFetch(`/withdraw?agentId=${row.id}`);
      const data = await res.json();
      if (data.success) setWithdrawRequests(data.data);
    } catch (e) {
      console.error("Withdraw fetch error:", e);
    }
  };

  const handleApprove = async (withdrawId) => {
    await apiFetch(`/withdraw/${withdrawId}/approve`, { method: "PUT" });
    const res = await apiFetch(`/withdraw?agentId=${popup.id}`);
    const data = await res.json();
    if (data.success) setWithdrawRequests(data.data);
    // refresh wallet list
    const wRes = await apiFetch("/wallets", { method: "GET" });
    const wData = await wRes.json();
    if (wData.success) {
      // Filter out refund-related agents from grid after approve/reject
      const filteredAgents = wData.data
        .filter(w => !hasRefundTransaction(w.transactions))
        .map((w) => ({
          id: w._id, agentId: w.agentId, name: w.name, mobile: w.mobile,
          totalEarnings: Number(w.totalEarnings) || 0, balance: Number(w.balance) || 0,
          withdrawn: Number(w.withdrawn) || 0, pending: Number(w.pending) || 0,
          transactions: w.transactions || [],
        }));
      setAgents(filteredAgents);
      setPopup(prev => ({ 
        ...prev, 
        ...wData.data.find(w => w._id === prev.id) 
      }));
    }
  };

  const handleReject = async (withdrawId) => {
    await apiFetch(`/withdraw/${withdrawId}/reject`, { method: "PUT" });
    const res = await apiFetch(`/withdraw?agentId=${popup.id}`);
    const data = await res.json();
    if (data.success) setWithdrawRequests(data.data);
  };

  const deleteAgents = async (rows) => {
    for (const row of rows) {
      await apiFetch(`/wallets/${row.id}`, { method: "DELETE" });
    }
    const res = await apiFetch("/wallets", { method: "GET" });
    const data = await res.json();
    if (data.success) {
      // Filter out refund-related agents from grid after delete
      const filteredAgents = data.data
        .filter(w => !hasRefundTransaction(w.transactions))
        .map((w) => ({ 
          id: w._id, agentId: w.agentId, name: w.name, mobile: w.mobile, 
          totalEarnings: Number(w.totalEarnings) || 0, balance: Number(w.balance) || 0, 
          withdrawn: Number(w.withdrawn) || 0, pending: Number(w.pending) || 0, 
          transactions: w.transactions || [] 
        }));
      setAgents(filteredAgents);
    }
  };

  const columns = [
    { accessorKey: "name", header: "Agent Name" },
    { accessorKey: "mobile", header: "Mobile" },
    { accessorKey: "totalEarnings", header: "Total Earnings (Rs.)" },
    { accessorKey: "balance", header: "Balance (Rs.)" },
    { accessorKey: "withdrawn", header: "Withdrawn (Rs.)" },
    { accessorKey: "pending", header: "Pending (Rs.)" },
    {
      header: "Action",
      Cell: ({ row }) => (
        <Button size="xs" variant="outline" color="green" onClick={() => handleView(row.original)}>
          View
        </Button>
      ),
    },
  ];

  const cardData = [
    { label: "Total Earnings", value: `Rs.${totalEarnings}`, icon: <FaWallet />, bg: "#CCFFCC" },
    { label: "Total Withdrawn", value: `Rs.${totalWithdrawn}`, icon: <FaMoneyBillWave />, bg: "#CCFFCC" },
    { label: "Pending Withdraw", value: `Rs.${totalPending}`, icon: <FaClock />, bg: "#fee2e2",color: "#991b1b" },
    { label: "Total Agents", value: agents.length, icon: <FaUsers />, bg: "#CCFFCC" },
  ];

  return (
    <div className="container-fluid bg-light py-4" style={{ minHeight: "100vh", width: "100%" }}>
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

      <div className="card" style={{ border: "1px solid #e5d3b3", borderRadius: "12px" }}>
        <div className="card-header" style={{ backgroundColor: "#CCFFCC", borderRadius: "12px 12px 0 0" }}>
          <h4 className="mb-0" style={{ color: "#4b2e05" }}><b>Agent Wallet List</b></h4>
        </div>
        <div className="card-body p-0">
          {loading ? <p className="p-3">Loading...</p> : <CommonTable columns={columns} data={agents} onDeleteSelected={deleteAgents} />}
        </div>
      </div>

      {popup && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
          background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center",
          justifyContent: "center", zIndex: 9999,
        }}>
          <div style={{ width: 750, background: "#fff", padding: 24, borderRadius: 10, maxHeight: "85vh", overflowY: "auto" }}>
            <div className="d-flex justify-content-between mb-3">
              <h5>{popup.name} — Wallet Details</h5>
              <Button size="xs" color="red" variant="outline" onClick={() => { setPopup(null); setWithdrawRequests([]); }}>✕</Button>
            </div>

            <div className="d-flex gap-4 mb-3">
              <span><b>Balance:</b> Rs.{popup.balance}</span>
              <span><b>Pending:</b> Rs.{popup.pending}</span>
              <span><b>Withdrawn:</b> Rs.{popup.withdrawn}</span>
            </div>

            {/* <h6 className="mt-3">Transaction History</h6>
            {popup.transactions.length === 0 ? <p>No transactions</p> : (
              <table className="table table-bordered table-sm">
                <thead><tr><th>Date</th><th>Description</th><th>Type</th><th>Amount</th></tr></thead>
                <tbody>
                  {popup.transactions.map((t, i) => (
                    <tr key={i}>
                      <td>{new Date(t.date).toLocaleDateString()}</td>
                      <td>{t.description}</td>
                      <td>{t.type}</td>
                      <td>Rs.{t.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )} */}

            <h6 className="mt-4">Withdrawal Requests</h6>
            {withdrawRequests.length === 0 ? <p>No requests</p> : (
              <table className="table table-bordered table-sm">
                <thead><tr><th>Date</th><th>Amount</th><th>UPI ID</th><th>Status</th><th>Action</th></tr></thead>
                <tbody>
                  {withdrawRequests.map((w) => (
                    <tr key={w._id}>
                      <td>{new Date(w.createdAt).toLocaleDateString()}</td>
                      <td>Rs.{w.amount}</td>
                      
                      <td>{w.bankDetails}</td>
                      <td>
                        <span style={{
                          padding: "2px 8px", borderRadius: 4, fontSize: 12, fontWeight: 600,
                          background: w.status === "Approved" ? "#d1fae5" : w.status === "Rejected" ? "#fee2e2" : "#fef3c7",
                          color: w.status === "Approved" ? "#065f46" : w.status === "Rejected" ? "#991b1b" : "#92400e"
                        }}>{w.status}</span>
                      </td>
                      <td>
                        {w.status === "Pending" && (
                          <div className="d-flex gap-1">
                            <Button size="xs" color="green" onClick={() => handleApprove(w._id)}>Approve</Button>
                            <Button size="xs" color="red" onClick={() => handleReject(w._id)}>Reject</Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

             <h6 className="mt-3">Transaction History</h6>
            {popup.transactions.length === 0 ? <p>No transactions</p> : (
              <table className="table table-bordered table-sm">
                <thead><tr><th>Date</th><th>Description</th><th>Type</th><th>Amount</th></tr></thead>
                <tbody>
                  {popup.transactions.map((t, i) => (
                    <tr key={i}>
                      <td>{new Date(t.date).toLocaleDateString()}</td>
                      <td>{t.description}</td>
                      <td>{t.type}</td>
                      <td>Rs.{t.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentWallet;
