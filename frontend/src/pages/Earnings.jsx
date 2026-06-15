import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@mantine/core";
import CommonTable from "../components/CommonTable";
import { apiFetch } from "../utils/apiFetch";
import { FaWallet, FaMoneyBillWave, FaClock, FaArrowUp } from "react-icons/fa";

const Earnings = () => {
  const navigate = useNavigate();
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const agentId = localStorage.getItem("userId");
        console.log("=== EARNINGS DEBUG ===");
        console.log("AgentId from localStorage:", agentId);
        console.log("localStorage keys:", Object.keys(localStorage));
        if (!agentId) {
          console.error("NO AGENTID - check login flow");
          return;
        }
        const url = `/wallets/agent/${agentId}?nocache=${Date.now()}`;
        console.log("Fetching wallet URL:", url);
        const res = await apiFetch(url);
        console.log("Response status:", res.status);
        console.log("Response headers:", [...res.headers.entries()]);
        const resClone = res.clone();
        const resText = await resClone.text();
        console.log("Raw response body:", resText);
        const data = JSON.parse(resText);
        console.log("Parsed data:", data);
        if (data.success) {
          console.log("Wallet data:", data.data);
          setWallet(data.data);
        } else {
          console.error("API success false:", data.message);
        }
      } catch (error) {
        console.error("Wallet fetch error:", error);
      }
      setLoading(false);
    };
    fetchWallet();
  }, []);

  const cardData = wallet ? [
    { label: "Total Earnings", value: `Rs.${wallet.totalEarnings || 0}`, icon: <FaWallet /> },
    { label: "Available Balance", value: `Rs.${wallet.balance || 0}`, icon: <FaMoneyBillWave /> },
    // { label: "Pending Withdrawal", value: `Rs.${wallet.pending || 0}`, icon: <FaClock /> },
    { label: "Pending Withdraw", value: `₹${wallet.pending || 0}`, icon: <FaClock />, bg: "#fee2e2", color: "#991b1b" },
    { label: "Total Withdrawn", value: `Rs.${wallet.withdrawn || 0}`, icon: <FaArrowUp /> },
  ] : [];

  const columns = [
    {
      header: "Date",
      Cell: ({ row }) => new Date(row.original.date).toLocaleDateString()
    },
    { accessorKey: "type", header: "Type" },
    {
      header: "Amount",
      Cell: ({ row }) => (
        <span style={{ color: row.original.type === "Credit" ? "#16a34a" : "#dc2626" }}>
          {row.original.type === "Credit" ? "+" : "-"}Rs.{row.original.amount}
        </span>
      )
    },
    { accessorKey: "description", header: "Description" },

  ];

  return (
    <div className="container-fluid bg-light py-4" style={{ minHeight: "100vh" }}>
      <br /><br /><br />

      {loading ? <p className="p-3">Loading...</p> : !wallet ? (
        <div className="p-3 text-danger">
          <p>Wallet not found or fetch failed.</p>
          <details>
            <summary>Debug info (check console first)</summary>
            <p>Open browser console (F12) for detailed logs.</p>
            <p>localStorage userId: {localStorage.getItem("userId") || "MISSING"}</p>
          </details>
        </div>
      ) : (
        <>
          <div className="d-flex flex-wrap justify-content-center gap-3 my-4">
            {cardData.map((card, idx) => (
              <div key={idx} style={{
                flex: "1 1 200px", display: "flex", alignItems: "center",
                background: card.label === "Pending Withdraw" ? "#fee2e2" : "#CCFFCC",
                padding: "20px", borderRadius: "16px", border: "1px solid #e5d3b3"
              }}>
                <div style={{
                  background: "rgba(0,0,0,0.05)", borderRadius: "50%", width: 60, height: 60,
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, marginRight: 15
                }}>{card.icon}</div>
                <div>
                  {/* <h5 style={{ color: "#163d0a" }}>{card.label}</h5>
                  <h4><b style={{ color: "#4aa031" }}>{card.value}</b></h4> */}
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
                </div>
              </div>
            ))}
          </div>

          <div className="card">
            <div
              className="card-header d-flex justify-content-between align-items-center"
              style={{ backgroundColor: "#CCFFCC" }}
            >
              <h4 className="mb-0"><b>Transaction History</b></h4>
              <Button size="sm" color="green" onClick={() => navigate("/withdraw")}>
                Withdraw Request
              </Button>
            </div>
            <div className="card-body p-0">
              <CommonTable columns={columns} data={
                (wallet.transactions || [])
                  .slice()
                  .sort((a, b) => new Date(b.date) - new Date(a.date))
              } onDeleteSelected={(rows) => { /* transactions are embedded, just filter locally */ }} />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Earnings;