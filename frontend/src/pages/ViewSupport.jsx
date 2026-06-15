import React, { useState, useEffect } from "react";
import CommonTable from "../components/CommonTable";
import { FaTicketAlt, FaCheckCircle, FaClock } from "react-icons/fa";
import { apiFetch } from "../utils/apiFetch";

const ViewSupports = () => {
    const [supports, setSupports] = useState([]);

    useEffect(() => {
        fetchSupports();
    }, []);

    const fetchSupports = async () => {
        try {
            const response = await apiFetch("/supports", {
                method: "GET",
            });

            const data = await response.json();

            setSupports(data);
        } catch (error) {
            console.error("Error fetching supports:", error);
            setSupports([]);
        }
    };

    const updateStatus = async (id, status) => {
        try {
            await apiFetch(`/supports/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }),
            });
            fetchSupports();
        } catch (error) {
            console.error("Error updating status:", error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Delete this supports ticket?")) {
            try {
                await apiFetch(`/supports/${id}`, {
                    method: "DELETE",
                });
                fetchSupports();
            } catch (error) {
                console.error("Error deleting supports:", error);
            }
        }
    };

    const totalSupports = supports.length;
    const openSupports = supports.filter(s => s.status === "Open").length;
    const closedSupports = supports.filter(s => s.status === "Closed").length;

    const columns = [
        // { accessorKey: "id", header: " Order ID" },
        { accessorKey: "email", header: "Email" },
        { accessorKey: "subject", header: "Subject" },
        { accessorKey: "message", header: "Message" },
        {
            accessorKey: "status",
            header: "Status",
            Cell: ({ row }) => (
                <span style={{
                    padding: "4px 10px",
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 600,
                    color: row.original.status === "Closed" ? "#92400e" : "#065f46",
                    background: row.original.status === "Closed" ? "#fef3c7" : "#d1fae5"
                }}>
                    {row.original.status}
                </span>
            ),
        },
        {
            header: "Actions",
            Cell: ({ row }) => (
                <div className="d-flex gap-2">
                    {row.original.status === "Open" && (
                        <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => updateStatus(row.original.id, "Closed")}
                        >
                            Close
                        </button>
                    )}
                    <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(row.original.id)}
                    >
                        Delete
                    </button>
                </div>
            ),
        },
    ];

    const cardData = [
        { label: "Total Tickets", value: totalSupports, icon: <FaTicketAlt />, bg: "#CCFFCC", color: "#163d0a" },
        { label: "Open", value: openSupports, icon: <FaClock />, bg: "#CCFFCC", color: "#163d0a" },
        { label: "Closed", value: closedSupports, icon: <FaCheckCircle />, bg: "#fee2e2", color: "#991b1b" },
    ];

    return (
        <div className="container-fluid bg-light py-4" style={{ minHeight: "100vh" }}>
            <br /><br /><br />

            <div className="d-flex flex-wrap justify-content-center gap-3 my-4">
                {cardData.map((card, idx) => (
                    <div key={idx} style={{
                        flex: "1 1 200px",
                        display: "flex",
                        alignItems: "center",
                        background: card.bg,
                        padding: "20px",
                        border: "1px solid #e5d3b3",
                        borderRadius: "16px"
                    }}>
                        <div style={{
                            background: "rgba(0,0,0,0.05)",
                            borderRadius: "50%",
                            width: 60,
                            height: 60,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 28,
                            marginRight: 15
                        }}>
                            {card.icon}
                        </div>
                        <div>
                            <h5 style={{
                                color: card.label === "Closed" ? "#991b1b" : "#163d0a"
                            }}>
                                {card.label}
                            </h5>

                            <h4>
                                <b style={{
                                    color: card.label === "Closed" ? "#991b1b" : "#4aa031"
                                }}>
                                    {card.value}
                                </b>
                            </h4>
                            {/* <h5 className="mb-1">{card.label}</h5>
                            <h4 className="mb-0"><b>{card.value}</b></h4> */}
                        </div>
                    </div>
                ))}
            </div>

            <div className="card" style={{ border: "1px solid #e5d3b3", borderRadius: "12px" }}>
                <div className="card-header" style={{ backgroundColor: "#CCFFCC" }}>
                    <h4 className="mb-0"><b>Supports Tickets</b></h4>
                </div>
                <div className="card-body p-0">
                    <CommonTable columns={columns} data={supports} onDeleteSelected={(rows) => { rows.forEach(r => handleDelete(r.id)); }} />
                </div>
            </div>
        </div>
    );
};

export default ViewSupports;
