import React, { useState, useEffect } from "react";
import CommonTable from "../components/CommonTable";
import { FaUserCheck, FaUserSlash, FaUsers } from "react-icons/fa";
import { apiFetch } from "../utils/apiFetch";

const Agents = () => {

  const [allAgents, setAllAgents] = useState([]);

  useEffect(() => {
    fetchAgents();
    const interval = setInterval(fetchAgents, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchAgents = async () => {
    try {
      console.log("Fetching agents...");

      const response = await apiFetch("/users?role=agent", {
        method: "GET",
      });

      const data = await response.json();
      console.log("Agents API:", data);

      let agentsArray = [];

      // ✅ HANDLE ALL API FORMATS (IMPORTANT)
      if (Array.isArray(data)) {
        agentsArray = data;
      } else if (Array.isArray(data.users)) {
        agentsArray = data.users;
      } else if (Array.isArray(data.data)) {
        agentsArray = data.data;
      }

      setAllAgents(agentsArray); // ✅ ALWAYS ARRAY

    } catch (error) {
      console.error("Error fetching agents:", error);
      setAllAgents([]);
    }
  };

  // ✅ SAFE ARRAY
  const safeAgents = Array.isArray(allAgents) ? allAgents : [];

  // ===== KPI =====
  const totalAgents = safeAgents.length;
  const now = new Date().getTime();
  const ONLINE_THRESHOLD = 10 * 60 * 1000; // 10 minutes

  const activeAgents = safeAgents.filter((a) => {
    if (!a.lastActive) return false;
    const lastActiveTime = new Date(a.lastActive).getTime();
    return (now - lastActiveTime) < ONLINE_THRESHOLD;
  }).length;
  const blockedAgents = safeAgents.length - activeAgents;

  // ===== ACTIONS =====
  const handleDelete = async (id) => {
    if (window.confirm("Delete Agent ?")) {
      try {
        await apiFetch(`/users/${id}`, {
          method: "DELETE"
        });
        fetchAgents();
      } catch (error) {
        console.error("Delete error:", error);
      }
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === "Active" ? "Blocked" : "Active";

      await apiFetch(`/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      fetchAgents();
    } catch (error) {
      console.error("Status error:", error);
    }
  };

  // ===== TABLE =====
  const columns = [
    { accessorKey: "_id", header: "Agent ID" },
    { accessorKey: "name", header: "Name" },
    { accessorKey: "email", header: "Email" },
    { accessorKey: "mobile", header: "Mobile" },
    { accessorKey: "vehicleNumber", header: "Vehicle No" },
    { accessorKey: "pincode", header: "Pincode" },

    {
      accessorKey: "status",
      header: "Status",
      Cell: ({ row }) => {
        const now = new Date().getTime();
        const ONLINE_THRESHOLD = 10 * 60 * 1000;
        const isActive = row.original.lastActive && (now - new Date(row.original.lastActive).getTime()) < ONLINE_THRESHOLD;
        const statusClass = `status-${isActive ? 'active' : 'blocked'}`;
        return <span className={`status ${statusClass}`}>{isActive ? 'Active' : 'Inactive'}</span>;
      },
    },

    {
      header: "Action",
      Cell: ({ row }) => (
        <div className="d-flex gap-2">
          <button
            className="btn btn-sm btn-outline-danger"
            onClick={() => handleDelete(row.original._id)}
          >
            Delete
          </button>

          <button
            className={`btn btn-sm ${row.original.status === "Active"
                ? "btn-outline-danger"
                : "btn-outline-primary"
              }`}
            onClick={() =>
              toggleStatus(row.original._id, row.original.status)
            }
          >
            {row.original.status === "Active" ? "Block" : "Unblock"}
          </button>
        </div>
      ),
    },
  ];

  // ===== CARDS =====
  const cardData = [
    {
      label: "Total Agents",
      value: totalAgents,
      icon: <FaUsers />,
      bg: "#CCFFCC",
    },
    {
      label: "Active Agents",
      value: activeAgents,
      icon: <FaUserCheck />,
      bg: "#CCFFCC",
    },
    {
      label: "Inactive Agents",
      value: blockedAgents,
      icon: <FaUserSlash />,
      bg: "#fee2e2",
      color: "#991b1b"
    },
  ];

  return (
    <div className="container-fluid bg-light py-4" style={{ minHeight: "100vh" }}>
      <br /><br /><br />

      {/* ===== CARDS ===== */}
      <div className="d-flex flex-wrap justify-content-center gap-3 my-4">
        {cardData.map((card, idx) => (
          <div
            key={idx}
            style={{
              flex: "1 1 200px",
              display: "flex",
              alignItems: "center",
              background: card.bg,
              padding: "20px",
              border: "1px solid #e5d3b3",
              borderRadius: "16px"
            }}
          >
            <div style={{ fontSize: 26, marginRight: 15 }}>
              {card.icon}
            </div>

            <div>
              <h5 style={{
                color: card.label === "Inactive Agents" ? "#991b1b" : "#163d0a"
              }}>
                {card.label}
              </h5>

              <h4>
                <b style={{
                  color: card.label === "Inactive Agents" ? "#991b1b" : "#4aa031"
                }}>
                  {card.value}
                </b>
              </h4>
              {/* <h5 className="mb-1">{card.label}</h5>
              <h4><b>{card.value}</b></h4> */}
            </div>
          </div>
        ))}
      </div>

      {/* ===== TABLE ===== */}
      <div className="card">
        <div className="card-header" style={{ backgroundColor: "#CCFFCC" }}>
          <h4><b>Agents List</b></h4>
        </div>

        <div className="card-body p-0">
          <CommonTable columns={columns} data={safeAgents} onDeleteSelected={(rows) => rows.forEach(r => handleDelete(r._id))} />
        </div>
      </div>
    </div>
  );
};

export default Agents;