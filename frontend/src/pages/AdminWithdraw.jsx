import React, { useEffect, useState } from "react";
import { Button } from "@mantine/core";
import CommonTable from "../components/CommonTable";
import { apiFetch } from "../utils/apiFetch";
import { FaClock, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

const AdminWithdraw = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const res = await apiFetch("/withdraw");
      const data = await res.json();
      if (data.success) setRequests(data.data);
    } catch (e) {
      console.error("Fetch error:", e);
    }
    setLoading(false);
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleApprove = async (id) => {
    await apiFetch(`/withdraw/${id}/approve`, { method: "PUT" });
    fetchRequests();
  };

  const handleReject = async (id) => {
    await apiFetch(`/withdraw/${id}/reject`, { method: "PUT" });
    fetchRequests();
  };

  const deleteRequests = async (rows) => {
    for (const row of rows) {
      await apiFetch(`/withdraw/${row._id}`, { method: "DELETE" });
    }
    fetchRequests();
  };

  const pending = requests.filter(r => r.status === "Pending").length;
  const approved = requests.filter(r => r.status === "Approved").length;
  const rejected = requests.filter(r => r.status === "Rejected").length;

  const cardData = [
    { label: "Pending", value: pending, icon: <FaClock />, bg: "#fef3c7", color: "#92400e" },
    { label: "Approved", value: approved, icon: <FaCheckCircle />, bg: "#d1fae5", color: "#065f46" },
    { label: "Rejected", value: rejected, icon: <FaTimesCircle />, bg: "#fee2e2", color: "#991b1b" },
  ];

  const columns = [
    {
      header: "Date",
      Cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString()
    },
    { accessorKey: "bank", header: "Bank" },
    { accessorKey: "bankDetails", header: "Account / UPI" },
    { accessorKey: "description", header: "Note" },
    {
      header: "Amount",
      Cell: ({ row }) => `Rs.${row.original.amount}`
    },
    {
      header: "Status",
      Cell: ({ row }) => {
        const s = row.original.status;
        return (
          <span style={{
            padding: "3px 10px", borderRadius: 4, fontSize: 12, fontWeight: 600,
            background: s === "Approved" ? "#d1fae5" : s === "Rejected" ? "#fee2e2" : "#fef3c7",
            color: s === "Approved" ? "#065f46" : s === "Rejected" ? "#991b1b" : "#92400e"
          }}>{s}</span>
        );
      }
    },
    {
      header: "Action",
      Cell: ({ row }) => row.original.status === "Pending" ? (
        <div className="d-flex gap-2">
          <Button size="xs" color="green" onClick={() => handleApprove(row.original._id)}>Approve</Button>
          <Button size="xs" color="red" onClick={() => handleReject(row.original._id)}>Reject</Button>
        </div>
      ) : "—"
    },
  ];

  return (
    <div className="container-fluid bg-light py-4" style={{ minHeight: "100vh", width: "100%" }}>
      <br /><br /><br />

      <div className="d-flex flex-wrap justify-content-center gap-3 my-4">
        {cardData.map((card, idx) => (
          <div key={idx} style={{
            flex: "1 1 180px", display: "flex", alignItems: "center",
            background: card.bg, padding: "20px", border: "1px solid #e5d3b3", borderRadius: "16px"
          }}>
            <div style={{
              background: "rgba(0,0,0,0.08)", borderRadius: "50%", width: 55, height: 55,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, marginRight: 14
            }}>{card.icon}</div>
            <div>
              <h5 className="mb-1" style={{ color: card.color }}>{card.label}</h5>
              <h4 className="mb-0" style={{ color: card.color }}><b>{card.value}</b></h4>
            </div>
          </div>
        ))}
      </div>

      <div className="card" style={{ border: "1px solid #e5d3b3", borderRadius: "12px" }}>
        <div className="card-header" style={{ backgroundColor: "#CCFFCC", borderRadius: "12px 12px 0 0" }}>
          <h4 className="mb-0" style={{ color: "#4b2e05" }}><b>Withdrawal Requests</b></h4>
        </div>
        <div className="card-body p-0">
          {loading ? <p className="p-3">Loading...</p> : <CommonTable columns={columns} data={requests} onDeleteSelected={deleteRequests} />}
        </div>
      </div>
    </div>
  );
};

export default AdminWithdraw;
