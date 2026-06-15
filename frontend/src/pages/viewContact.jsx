import React, { useState, useEffect } from "react";
import CommonTable from "../components/CommonTable";
import { FaEnvelope, FaCheckCircle, FaClock } from "react-icons/fa";
import { apiFetch } from "../utils/apiFetch";

const ViewContact = () => {
    const [contacts, setContacts] = useState([]);

    useEffect(() => {
        fetchContacts();
    }, []);

    const fetchContacts = async () => {
        try {
            // const response = await fetch("http://localhost:5000/contacts");
            const response = await apiFetch("/contacts", {
                method: "GET",
            });

            const data = await response.json();
            setContacts(data);
        } catch (error) {
            console.error("Error fetching contacts:", error);
            setContacts([]);
        }
    };

    const updateStatus = async (id, status) => {
        try {
            await apiFetch(`/contacts/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }),
            });
            fetchContacts();
        } catch (error) {
            console.error("Error updating status:", error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Delete this contact?")) {
            try {
                await apiFetch(`/contacts/${id}`, {
                    method: "DELETE",
                });
                fetchContacts();
            } catch (error) {
                console.error("Error deleting contact:", error);
            }
        }
    };

    const totalContacts = contacts.length;
    const pendingContacts = contacts.filter(c => c.status === "Pending").length;
    const resolvedContacts = contacts.filter(c => c.status === "Resolved").length;

    const columns = [
        // { accessorKey: "id", header: "ID" },
        { accessorKey: "name", header: "Name" },
        { accessorKey: "email", header: "Email" },
        { accessorKey: "message", header: "Message" },
        {
            accessorKey: "status",
            header: "Status",
            Cell: ({ row }) => (
                <span className={`status ${row.original.status === "Resolved" ? "status-resolved status-closed" : "status-pending status-open"}`}>
                    {row.original.status}
                </span>
            ),
        },
        {
            header: "Actions",
            Cell: ({ row }) => (
                <div className="d-flex gap-2">
                    {row.original.status === "Pending" && (
                        <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => updateStatus(row.original.id, "Resolved")}
                        >
                            Resolve
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
        { label: "Total Contacts", value: totalContacts, icon: <FaEnvelope />, bg: "#CCFFCC", color: "#163d0a" },
        { label: "Pending", value: pendingContacts, icon: <FaClock />, bg: "#fee2e2", color: "#991b1b" },
        { label: "Resolved", value: resolvedContacts, icon: <FaCheckCircle />, bg: "#CCFFCC", color: "#163d0a" },
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
                                color: card.label === "Pending" ? "#991b1b" : "#163d0a"
                            }}>
                                {card.label}
                            </h5>

                            <h4>
                                <b style={{
                                    color: card.label === "Pending" ? "#991b1b" : "#4aa031"
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
                    <h4 className="mb-0"><b>Contact Messages</b></h4>
                </div>
                <div className="card-body p-0">
                    <CommonTable columns={columns} data={contacts} onDeleteSelected={(rows) => { rows.forEach(r => handleDelete(r.id)); }} />
                </div>
            </div>
        </div>
    );
};

export default ViewContact;
