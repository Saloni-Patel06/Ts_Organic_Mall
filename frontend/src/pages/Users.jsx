import React, { useState, useEffect } from "react";
import { Button } from '@mantine/core';
import CommonTable from "../components/CommonTable";
import { FaUser, FaUserCheck, FaUserTimes } from "react-icons/fa";
import { apiFetch } from "../utils/apiFetch";

const Users = () => {
    const [allUsers, setAllUsers] = useState([]);

    const fetchUsers = async () => {
        try {
            console.log("Fetching users from API...");

            const response = await apiFetch("/users?role=customer", {
                method: "GET",
            });

            const data = await response.json();
            console.log("Users fetched:", data);

            let usersArray = [];

            // ✅ HANDLE ALL API FORMATS
            if (Array.isArray(data)) {
                usersArray = data;
            } else if (Array.isArray(data.users)) {
                usersArray = data.users;
            } else if (Array.isArray(data.data)) {
                usersArray = data.data;
            }

            setAllUsers(usersArray); // ✅ ALWAYS ARRAY
        } catch (error) {
            console.error("Error fetching users:", error);
            setAllUsers([]); // safety
        }
    };

    const toggleStatus = async (id, currentStatus) => {
        try {
            const newStatus = currentStatus === "Active" ? "Blocked" : "Active";

            const response = await apiFetch(`/users/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`HTTP ${response.status}: ${errorData.message || response.statusText}`);
            }

            fetchUsers();
        } catch (error) {
            console.error("Status error:", error);
            alert(`Status update failed: ${error.message}`);
        }
    };

    const deleteUsers = async (rows) => {
        for (const row of rows) {
            await apiFetch(`/users/${row._id}`, { method: "DELETE" });
        }
        fetchUsers();
    };

    useEffect(() => {
        fetchUsers();
        const interval = setInterval(fetchUsers, 15000); // Poll every 15 seconds
        return () => clearInterval(interval);
    }, []);

    // ✅ SAFE FILTERS
    const safeUsers = Array.isArray(allUsers) ? allUsers : [];

    const totalUsers = safeUsers.length;

    const now = new Date().getTime();
    const ONLINE_THRESHOLD = 10 * 60 * 1000; // 10 minutes

    const onlineUsers = safeUsers.filter((u) => {
        if (!u.lastActive) return false;
        const lastActiveTime = new Date(u.lastActive).getTime();
        return (now - lastActiveTime) < ONLINE_THRESHOLD;
    }).length;

    const offlineUsers = totalUsers - onlineUsers;

    const onlineStyle = (isOnline) => ({
        padding: "4px 10px",
        borderRadius: 6,
        fontSize: 12,
        fontWeight: 600,
        color: isOnline ? "#065f46" : "#dc2626",
        background: isOnline ? "#d1fae5" : "#fee2e2"
    });

    const onlineBadge = (user) => {
        const now = new Date().getTime();
        const ONLINE_THRESHOLD = 10 * 60 * 1000;
        const isOnline = user.lastActive && (now - new Date(user.lastActive).getTime()) < ONLINE_THRESHOLD;
        return (
            <span style={onlineStyle(isOnline)}>
                {isOnline ? "Active" : "Inactive"}
            </span>
        );
    };

    const columns = [
        { accessorKey: "_id", header: "Customer ID" },
        { accessorKey: "name", header: "Name" },
        { accessorKey: "email", header: "Email" },
        { accessorKey: "mobile", header: "Mobile" },
        { accessorKey: "address", header: "Address" },
        {
            accessorKey: "status",
            header: "Online Status",
            Cell: ({ row }) => onlineBadge(row.original),
        },
        {
            header: "Action",
            Cell: ({ row }) => (
                <Button
                    size="xs"
                    variant="outline"
                    color={row.original.status === "Active" ? "red" : "green"}
                    onClick={() =>
                        toggleStatus(row.original._id, row.original.status)
                    }
                >
                    {row.original.status === "Active" ? "Block" : "Unblock"}
                </Button>
            ),
        },
    ];

    const cardData = [
        {
            label: "Total Users",
            value: totalUsers,
            icon: <FaUser />,
            bg: "#CCFFCC",
            color: "#163d0a",
        },
        {
            label: "Online Users",
            value: onlineUsers,
            icon: <FaUserCheck />,
            bg: "#CCFFCC",
            color: "#163d0a",
        },
        {
            label: "Offline Users",
            value: offlineUsers,
            icon: <FaUserTimes />,
            bg: "#fee2e2",
            color: "#991b1b",
        },
    ];

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
            
            <div className="card" style={{ border: "1px solid #e5d3b3", borderRadius: "12px" }}>
                <div className="card-header" style={{ backgroundColor: "#CCFFCC" }}>
                    <h4 className="mb-0">
                        <b>Users List</b>
                    </h4>
                </div>
                <div className="card-body p-0">
                    <CommonTable columns={columns} data={safeUsers} onDeleteSelected={deleteUsers} />
                </div>
            </div>
        </div>
    );
};

export default Users;