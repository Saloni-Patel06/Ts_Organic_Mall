import React, { useState, useEffect, useMemo } from "react";
import {
  FaUsers,
  // FaRupeeSign,
  FaCheckCircle,
  FaTimesCircle,
  FaChartBar,
  FaExclamationTriangle
} from "react-icons/fa";
import { apiFetch } from "../../utils/apiFetch";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

const AdminDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchOrders();
    fetchProducts();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await apiFetch("/orders", { method: "GET" });
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setOrders([]);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await apiFetch("/manage-products", { method: "GET" });
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
    }
  };

  // Order counts
  const totalOrders = orders.length;
  const approved = orders.filter(o => o.status === "Approved").length;
  const cancelled = orders.filter(o => o.status === "Cancelled").length;
  const pending = orders.filter(o => o.status === "Pending").length;

  // const totalRevenue = orders.reduce(
  //   (sum, o) => (o.status === "Approved" ? sum + o.totalAmount : sum),
  //   0
  // );


  // Most ordered products - alternative calculation with product matching
  const mostOrderedData = useMemo(() => {
    console.log('Processing orders for chart:', orders.length);

    const productCount = {};

    // Try multiple possible fields
    orders.forEach(order => {
      ['products', 'items'].forEach(field => {
        if (order[field] && Array.isArray(order[field])) {
          order[field].forEach(item => {
            const name = item.productName || item.name || item.ProductName || item.Product_name || 'Unknown Product';
            const qty = item.quantity || item.qty || 1;
            productCount[name] = (productCount[name] || 0) + qty;
          });
        }
      });
    });

    console.log('Product counts:', productCount);

    const sortedData = Object.entries(productCount)
      .filter(([name]) => name !== 'Unknown Product')
      .sort(([, a], [, b]) => b - a)
      .slice(0, 12)
      .map(([name, orders], index) => ({
        name: name.length > 22 ? name.slice(0, 22) + "..." : name,
        orders: orders,
        fill: `hsl(${(index * 30) % 360}, 70%, 50%)`
      }));

    console.log('Final chart data:', sortedData);

    return sortedData.length > 0 ? sortedData : [{
      name: 'No Orders Yet',
      orders: 0,
      fill: '#9ca3af'
    }];
  }, [orders]);

  // Low stock data for doughnut - with debug logs
  const lowStockDoughnutData = useMemo(() => {
    console.log("Low stock processing products:", products.length);

    // 🎯 Severity-based colors (more meaningful UI)
    const getColorByStock = (stock) => {
      if (stock <= 3) return "#dc2626"; // 🔴 Critical (red)
      if (stock <= 6) return "#f97316"; // 🟠 Very low (orange)
      if (stock <= 10) return "#f59e0b"; // 🟡 Low (amber)
      return "#9ca3af"; // ⚪ fallback
    };

    const lowStock = products
      .filter((p) => p.stock !== undefined && p.stock <= 10 && p.stock >= 0)

      // 📊 sort: most critical first
      .sort((a, b) => a.stock - b.stock)

      .map((p) => {
        const stock = p.stock || 0;

        return {
          name: p.name
            ? p.name.length > 18
              ? p.name.slice(0, 18) + "..."
              : p.name
            : "Unnamed Product",

          // 📉 better visual weight (lower stock = bigger slice)
          value: 11 - stock,

          stock,

          category: p.category || "Uncategorized",

          fill: getColorByStock(stock),
        };
      });

    console.log("Low stock final data:", lowStock);

    const result =
      lowStock.length > 0
        ? lowStock
        : [
          {
            name: "All Stock Healthy 🎉",
            value: 100,
            fill: "#22c55e",
          },
        ];

    return result;
  }, [products]);

  // Cards data
  const cardData = [
    { label: "Total Orders", value: totalOrders, icon: <FaUsers />, bg: "#CCFFCC", color: "#92400e" },
    // { label: "Revenue", value: `Rs. ${totalRevenue.toLocaleString() }`, icon: <FaRupeeSign />, bg: "#CCFFCC", color: "#92400e" },
    
    { label: "Approved", value: approved, icon: <FaCheckCircle />, bg: "#CCFFCC", color: "#92400e" },
    { label: "Pending", value: pending, icon: <FaUsers />, bg: "#ccffcc", color: "#92400e" },
    { label: "Cancelled", value: cancelled, icon: <FaTimesCircle />, bg: "#fee2e2", color: "#991b1b" }
  ];

  return (
    <div className="container-fluid bg-light py-4" style={{ minHeight: "100vh" }}>
      <br /><br /><br />

      {/* Cards */}
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
              <h5 style={{ marginBottom: "5px", color: card.label === "Cancelled" ? "#991b1b" : "#163d0a" }}>
                {card.label}
              </h5>
              <h4 style={{ margin: 0, color: card.label === "Cancelled" ? "#991b1b" : "#4aa031" }}>
                <b>{card.value}</b>
              </h4>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="row g-4 mb-4">
        {/* Most Ordered Horizontal Bar */}
        <div className="col-lg-6">
          <div className="card" style={{ border: "1px solid #e5d3b3", borderRadius: "12px" }}>
            <div className="card-header" style={{
              backgroundColor: "#CCFFCC",
              borderBottom: "1px solid #e5d3b3",
              borderRadius: "12px 12px 0 0"
            }}>
              <FaChartBar className="me-2" />
              <h5 className="mb-0" style={{ color: "#4b2e05" }}>
                <b>Most Ordered Products</b>
              </h5>
            </div>
            <div className="card-body p-4">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={mostOrderedData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />

                  <XAxis dataKey="name" type="category" width={160} />
                  <YAxis type="number" />

                  <Tooltip />

                  <Bar dataKey="orders" radius={[4, 4, 4, 4]}>
                    {mostOrderedData.map((entry, index) => {
                      const shades = [
                        "#1e8a47",
                        "#F97316",
                        "#3B82F6",
                        "#60A5FA",
                        "#93C5FD",
                        "#07941a",
                        "#0F766E",
                        "#14B8A6",
                        "#2DD4BF",
                        "#F59E0B",

                      ];

                      return (
                        <Cell
                          key={`bar-${index}`}
                          fill={shades[index % shades.length]}
                        />
                      );
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        {/* Low Stock Doughnut */}
        <div className="col-lg-6">
          <div className="card" style={{ border: "1px solid #e5d3b3", borderRadius: "12px" }}>
            <div className="card-header" style={{
              backgroundColor: "#fee2e2",
              borderBottom: "1px solid #e5d3b3",
              borderRadius: "12px 12px 0 0"
            }}>
              <FaExclamationTriangle className="me-2" style={{ color: "#991b1b" }} />
              <h5 className="mb-0" style={{ color: "#991b1b" }}>
                <b>Low Stock Products (≤10)</b>
              </h5>
            </div>
            <div className="card-body p-4" style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
              <div style={{ flex: '1 1 60%', height: '200px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={lowStockDoughnutData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={85}
                      cornerRadius={8}
                      dataKey="value"
                      nameKey="name"
                    >
                      {lowStockDoughnutData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ flex: '1 1 40%', minWidth: '200px' }}>
                <h6 className="mb-3" style={{ color: '#991b1b', fontWeight: 'bold' }}>Products:</h6>
                {lowStockDoughnutData.length > 0 && lowStockDoughnutData[0].stock !== undefined ? (
                  lowStockDoughnutData.slice(0, 10).map((item, index) => (
                    item.name !== 'All Stock Healthy 🎉' && (
                      <div key={index} className="mb-2 d-flex align-items-center" style={{ fontSize: '14px' }}>
                        <div
                          style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            backgroundColor: item.fill,
                            marginRight: '8px',
                            flexShrink: 0
                          }}
                        />
                        <span style={{ fontWeight: 500 }}>{item.name}</span>
                        <span className="ms-auto text-muted" style={{ fontSize: '12px' }}>
                          ({item.stock})
                        </span>
                      </div>
                    )
                  ))
                ) : (
                  <div className="text-center text-muted">✅ All stocked</div>
                )}
              </div>
            </div>
          </div>
        </div>


      </div>

    </div>
  );
};

export default AdminDashboard;