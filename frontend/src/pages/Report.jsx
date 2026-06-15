import React, { useState, useEffect, useMemo } from "react";
import { Select } from '@mantine/core';
import CommonTable from "../components/CommonTable";
import { apiFetch } from "../utils/apiFetch";
import { FaFileInvoiceDollar, FaChartLine, FaCalendarCheck,  FaTimesCircle } from "react-icons/fa";

const Report = () => {
    const [allOrders, setAllOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

    // Month names
    const monthNames = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    const monthData = monthNames.map((name, idx) => ({
        value: (idx + 1).toString(),
        label: name
    }));

    // Year options
    const yearOptions = useMemo(() => {
        const years = [];
        const currentYear = new Date().getFullYear();
        for (let year = currentYear - 5; year <= currentYear + 1; year++) {
            years.push({ value: year.toString(), label: year.toString() });
        }
        return years;
    }, []);

    // Fetch all orders
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                const res = await apiFetch("/orders");
                const data = await res.json();
                setAllOrders(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Orders fetch error:", error);
                setAllOrders([]);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    // Filter orders by month/year
    const monthOrders = useMemo(() => {
        return allOrders
            .filter(order => order.createdAt)
            .filter(order => {
                const orderDate = new Date(order.createdAt);
                return orderDate.getFullYear().toString() === selectedYear &&
                    (orderDate.getMonth() + 1).toString() === selectedMonth;
            })
            .map(order => ({
                id: order._id,
                orderId: `#ORD${order._id?.slice(-6) || 'N/A'}`,
                customerName: order.customerName || "N/A",
                totalAmount: Number(order.totalAmount || 0),
                status: order.status || "Unknown",
                paymentStatus: order.paymentStatus || "Unknown",
                date: new Date(order.createdAt).toLocaleDateString('en-GB'),
            }))
            .sort((a, b) => new Date(b.date) - new Date(a.date));
    }, [allOrders, selectedMonth, selectedYear]);

    // Summary
    const summary = useMemo(() => {
        const paidOrders = monthOrders.filter(o => o.paymentStatus === "Paid");
        return {
            totalOrders: monthOrders.length,
            totalRevenue: paidOrders.reduce((sum, o) => sum + o.totalAmount, 0).toLocaleString('en-IN'),
            paidCount: paidOrders.length,
            pendingCount: monthOrders.filter(o => o.paymentStatus === "Pending").length,
            cancelledCount: monthOrders.filter(o => o.status === "Cancelled").length,
        };
    }, [monthOrders]);

    const columns = [
        // { accessorKey: "orderId", header: "Order ID" },
        { accessorKey: "customerName", header: "Customer" },
        { accessorKey: "date", header: "Date" },
        {
            accessorKey: "totalAmount",
            header: "Total (Rs.)",
            Cell: ({ row }) => `Rs. ${row.original.totalAmount?.toLocaleString('en-IN') || '0'}`
        },
        { accessorKey: "paymentStatus", header: "Payment Status" },
        { accessorKey: "status", header: "Status" },
        // { accessorKey: "paymentStatus", header: "Payment Status" },
        // { accessorKey: "date", header: "Date" },
    ];

    return (
        <div className="container-fluid bg-light py-4" style={{ minHeight: "100vh", width: "100%" }}>
            <br /><br /><br />



            {/* Summary Cards */}
            <div className="d-flex flex-wrap justify-content-center gap-3 my-4">
                {[
                  { label: "Total Orders", value: summary.totalOrders, icon: <FaFileInvoiceDollar />, bg: "#CCFFCC", color: "#92400E" },
                  { label: "Revenue (Paid)", value: `Rs. ${summary.totalRevenue}`, icon: <FaChartLine />, bg: "#CCFFCC", color: "#92400E" },
                  { label: "Paid", value: summary.paidCount, icon: <FaCalendarCheck />, bg: "#CCFFCC", color: "#3b82f6" },
                //   { label: "Pending", value: summary.pendingCount, icon: <FaClock />, bg: "#FFF3CD", color: "#f59e0b" },
                  { label: "Cancelled", value: summary.cancelledCount, icon: <FaTimesCircle />, bg: "#F8D7DA", color: "#dc2626" }
                ].map((card, idx) => (
                  <div key={idx} style={{
                    flex: "1 1 220px",
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
                      fontSize: 26,
                      marginRight: 15
                    }}>
                      {card.icon}
                    </div>
                    <div>
                      <h5 className="mb-1" style={{ color: card.color === "#dc2626" ? "#991b1b" : "#163d0a" }}>
                        {card.label}
                      </h5>
                      <h4 className="mb-0" style={{ color: card.color === "#dc2626" ? "#991b1b" : "#4aa031" }}>
                        <b>{card.value}</b>
                      </h4>
                    </div>
                  </div>
                ))}
              </div>

            {/* Filters */}
            <div className="row mb-4 g-3 align-items-end">
                <div className="col-md-3">
                    <label className="form-label fw-bold small mb-1">Month</label>
                    <Select data={monthData} value={selectedMonth} onChange={setSelectedMonth} />
                </div>
                <div className="col-md-3">
                    <label className="form-label fw-bold small mb-1">Year</label>
                    <Select data={yearOptions} value={selectedYear} onChange={setSelectedYear} />
                </div>
                <div className="col-md-6">
                    <h5 className="mb-0 text-muted">
                        {monthNames[parseInt(selectedMonth) - 1]} {selectedYear} ({summary.totalOrders} orders)
                    </h5>
                </div>
            </div>

            {/* Table */}
            <div className="card" style={{ border: "1px solid #e5d3b3", borderRadius: "12px" }}>
                <div className="card-header" style={{ backgroundColor: "#CCFFCC", borderRadius: "12px 12px 0 0 !important" }}>
                    <h4 className="mb-0" style={{ color: "#4b2e05" }}><b>Orders Report - {monthNames[parseInt(selectedMonth) - 1]} {selectedYear}</b></h4>
                </div>
                <div className="card-body p-0">
                    {loading ? (
                        <div className="p-4 text-center">
                            <div className="spinner-border text-success" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    ) : monthOrders.length === 0 ? (
                        <div className="p-5 text-center text-muted">
                            <FaFileInvoiceDollar size={64} className="mb-3 opacity-50" />
                            <h5>No orders found for this month</h5>
                            <p className="mb-0">Try selecting a different month/year</p>
                        </div>
                    ) : (
                        <CommonTable columns={columns} data={monthOrders} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default Report;

