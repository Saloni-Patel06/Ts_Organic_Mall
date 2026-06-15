import React, { useState, useEffect, useMemo } from "react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line
} from "recharts";
// import CommonTable from "../../components/CommonTable";
import { apiFetch } from "../../utils/apiFetch";

// ===== ICONS =====
import { FaBoxOpen } from "react-icons/fa";
import { MdDeliveryDining } from "react-icons/md";
import { BsCheckCircleFill } from "react-icons/bs";
import { FaIndianRupeeSign } from "react-icons/fa6";

const DeliveryDashboard = () => {
  const [orders, setOrders] = useState([]);

  // ===== FETCH ORDERS =====
  useEffect(() => {
    const agentId = localStorage.getItem("userId");
    if (!agentId) return;

    const fetchOrders = async () => {
      try {
        const res = await apiFetch(`/orders?agentId=${agentId}`, {
          method: "GET",
        });
        const data = await res.json();
        setOrders(data);
      } catch (err) {
        console.error("Error fetching orders:", err);
      }
    };

    fetchOrders();
  }, []);

  // ===== SUMMARY =====
  const totalOrders = orders.length;
  const delivered = orders.filter(o => o.status === "Delivered").length;
  const outDelivery = orders.filter(o => o.status === "Out for Delivery").length;
  // const pending = orders.filter(o => o.status === "Pending").length;
  // const assigned = orders.filter(o => o.status === "Assigned").length;
  // const cancelled = orders.filter(o => o.status === "Cancelled").length;

  // ===== COMMISSION =====
  const commission = orders
    .filter(o => o.status === "Delivered")
    .reduce((sum, o) => sum + o.totalAmount * 0.1, 0);

  // ===== CHART DATA =====


  const trendData = useMemo(() => {
    const thirtyDays = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    const dailyData = thirtyDays.reduce((acc, date) => {
      const dayDeliveries = orders.filter(o => {
        const orderDate = new Date(o.createdAt).toISOString().split('T')[0];
        return orderDate === date && o.status === 'Delivered';
      }).length;
      const dayCommission = orders.filter(o => {
        const orderDate = new Date(o.createdAt).toISOString().split('T')[0];
        return orderDate === date && o.status === 'Delivered';
      }).reduce((sum, o) => sum + o.totalAmount * 0.1, 0);
      acc.push({ date, deliveries: dayDeliveries, commission: Math.round(dayCommission) });
      return acc;
    }, []);
    return dailyData;
  }, [orders]);

  const bestDay = trendData.length > 0
    ? trendData.reduce((max, curr) =>
      curr.commission > max.commission ? curr : max
    )
    : null;



  // ===== SUMMARY CARDS =====
  const cardData = [
    {
      label: "Total Orders",
      value: totalOrders,
      icon: <FaBoxOpen />,
      bg: "#CCFFCC",
      color: "#92400E",
    },
    {
      label: "Out for Delivery",
      value: outDelivery,
      icon: <MdDeliveryDining />,
      bg: "#CCFFCC",
      color: "#92400E",
    },
    {
      label: "Delivered",
      value: delivered,
      icon: <BsCheckCircleFill />,
      bg: "#CCFFCC",
      color: "#92400E",
    },
    {
      label: "Commission",
      value: `Rs. ${commission.toFixed(2)}`,
      icon: <FaIndianRupeeSign />,
      bg: "#CCFFCC",
      color: "#92400E",
    },
  ];

  return (
    <div className="container-fluid bg-light py-4" style={{ minHeight: "100vh", width: "100%" }}>
      <br /><br /><br />

      {/* ===== SUMMARY CARDS ===== */}
      <div className="d-flex flex-wrap justify-content-center gap-3 my-4">
        {cardData.map((card, idx) => (
          <div key={idx} style={{
            flex: "1 1 220px",
            display: "flex",
            alignItems: "center",
            background: card.bg,
            color: card.color,
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
              <h5 className="mb-1" style={{ color: "#163d0a" }}>
                {card.label}
              </h5>
              <h4 className="mb-0" style={{ color: "#4aa031" }}>
                <b>{card.value}</b>
              </h4>
            </div>
          </div>
        ))}
      </div>

      {/* ===== SINGLE CLEAN CHART ===== */}
      <div className="card" style={{ borderRadius: "12px" }}>
        <div style={{
          background: "linear-gradient(135deg,#d9fdd3,#ccf7c8)",
          padding: 15,
          borderRadius: "12px 12px 0 0"
        }}>
          <h5 className="mb-0">📊 Delivery & Commission Trend (Last 30 Days)</h5>
        </div>

        <div className="p-4">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="deliveries" stroke="#22c55e" strokeWidth={3} />
              <Line type="monotone" dataKey="commission" stroke="#f97316" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>

{/* 
            <div className="col-md-3">
              <div style={{ background: "#f0fdf4", padding: 10, borderRadius: 10 }}>
                <h6>Best Day</h6>
                <h5>{bestDay ? bestDay.date : "-"}</h5>
              </div>
            </div> */}


          {/* ===== BEST DAY ===== */}
          {bestDay && (
            <div style={{
              padding: 10,
              borderRadius: 10,
              background: "#CCFFCC",
              color: "#065f46"
            }}>
              💰 Best Day: <b>{bestDay.date}</b> — ₹{bestDay.commission}
            </div>
          )}
        </div>
      </div>
    </div>

  );
};

export default DeliveryDashboard;