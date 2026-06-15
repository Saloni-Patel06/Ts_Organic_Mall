import getImage from "../utils/imagePath";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../utils/apiFetch";

const Products = ({ cartQty, setCartQty }) => {
  const navigate = useNavigate();
  const [category, setCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState([]);

  useEffect(() => {
    apiFetch("/manage-products")
      .then(res => res.json())
      .then(data => setProducts(Array.isArray(data) ? data : []))
      .catch(err => console.error("Products fetch error:", err));
  }, []);

  const cartKey = (p) => `${p.id}_${p.unit}`;

  const addToCart = async (p) => {
    const key = cartKey(p);
    const currentQty = cartQty[key] || 0;
    if (currentQty >= p.stock) { alert("Out of Stock"); return; }
    try {
      await apiFetch("/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: p.id, productName: p.name, price: p.price, quantity: 1, unit: p.unit })
      });
    } catch (e) { console.error(e); }
    setCartQty(prev => ({ ...prev, [key]: currentQty + 1 }));
  };

  const increaseQty = async (p) => {
    const key = cartKey(p);
    const currentQty = cartQty[key] || 0;
    if (currentQty >= p.stock) { alert("Out of Stock"); return; }
    try {
      await apiFetch("/cart/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: p.id, quantity: currentQty + 1, unit: p.unit })
      });
    } catch (e) { console.error(e); }
    setCartQty(prev => ({ ...prev, [key]: currentQty + 1 }));
  };

  const decreaseQty = async (p) => {
    const key = cartKey(p);
    const currentQty = cartQty[key] || 0;
    try {
      if (currentQty - 1 <= 0) {
        await apiFetch("/cart/remove", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: p.id, unit: p.unit })
        });
      } else {
        await apiFetch("/cart/update", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: p.id, quantity: currentQty - 1, unit: p.unit })
        });
      }
    } catch (e) { console.error(e); }
    setCartQty(prev => {
      const qty = (prev[key] || 0) - 1;
      if (qty <= 0) { const u = { ...prev }; delete u[key]; return u; }
      return { ...prev, [key]: qty };
    });
  };

  const totalItems = Object.values(cartQty).reduce((a, b) => a + b, 0);
  const filtered = products.filter(p => (category === "All" || p.category === category) && p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <>
      <style>{`
        .cat-btn { border: 1.5px solid #3CB815; color: #3CB815; background: #fff; border-radius: 20px; padding: 5px 18px; font-weight: 600; font-size: 14px; cursor: pointer; transition: all 0.2s; }

        .cat-btn.active, .cat-btn:hover { background: #3CB815; color: #fff; }
        .search-input { border: 1.5px solid #3CB815; border-radius: 20px; padding: 8px 15px; font-size: 14px; width: 250px; outline: none; background: #fff; }
        .search-input:focus { border-color: #2e9d0f; box-shadow: 0 0 0 3px rgba(60,184,21,0.1); }
        .prod-card { background: #fff; border-radius: 14px; border: 1px solid #e8e8e8; overflow: hidden; transition: box-shadow 0.2s; position: relative; }
        .prod-card:hover { box-shadow: 0 4px 18px rgba(0,0,0,0.10); }
        .prod-img { width: 100%; height: 200px; object-fit: cover; background: #f5f5f5; }
        .unit-badge { display: inline-block; background: #f0f0f0; color: #555; border-radius: 6px; font-size: 12px; font-weight: 600; padding: 2px 8px; margin-bottom: 4px; }
        .prod-name { font-size: 15px; font-weight: 700; color: #1a1a1a; margin-bottom: 2px; }
        .prod-price { font-size: 17px; font-weight: 800; color: #1a1a1a; }
        .add-btn { background: #fff; border: 2px solid #3CB815; color: #3CB815; border-radius: 8px; font-weight: 700; font-size: 15px; padding: 4px 18px; cursor: pointer; transition: all 0.15s; }
        .add-btn:hover { background: #3CB815; color: #fff; }
        .qty-box { display: flex; align-items: center; background: #3CB815; border-radius: 8px; overflow: hidden; }
        .qty-btn { background: transparent; border: none; color: #fff; font-size: 18px; font-weight: 700; padding: 2px 10px; cursor: pointer; line-height: 1; }
        .qty-num { color: #fff; font-weight: 700; font-size: 15px; min-width: 24px; text-align: center; }
        .out-badge { position: absolute; top: 10px; left: 10px; background: #ff4d4d; color: #fff; font-size: 11px; font-weight: 700; border-radius: 6px; padding: 2px 8px; }
        .cart-bar { position: fixed; bottom: 0; left: 0; right: 0; background: #3CB815; color: #fff; padding: 12px 24px; display: flex; justify-content: space-between; align-items: center; z-index: 999; box-shadow: 0 -2px 12px rgba(0,0,0,0.15); }
        .cart-bar-btn { background: #fff; color: #3CB815; border: none; border-radius: 8px; font-weight: 700; padding: 6px 20px; font-size: 15px; cursor: pointer; }
        .col-xl-5th { width: 20%; padding: 0 6px; }
        @media (max-width: 1199px) { .col-xl-5th { width: 33.33%; } }
        @media (max-width: 767px) { .col-xl-5th { width: 50%; } }
      `}</style>

      <div className="container-fluid py-4" style={{ minHeight: "100vh", background: "#f8f8f8" }}>
        <br /><br /><br /><br />
        <div className="container">

          {/* Header + Filter */}
          <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
            <h4 style={{ fontWeight: 800, color: "#1a1a1a" }}>Fresh Groceries 🛒</h4>
            <div className="d-flex gap-2 flex-wrap">
              <input
                type="text"
                className="search-input"
                placeholder="🔍 Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {["All", "Fruits", "Vegetables"].map(cat => (
                <button key={cat} className={`cat-btn ${category === cat ? "active" : ""}`} onClick={() => setCategory(cat)}>
                  {cat === "All" ? "🌿 All" : cat === "Fruits" ? "🍎 Fruits" : "🥦 Vegetables"}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          <div className="row g-3">
            {filtered.map((p) => {
              const key = cartKey(p);
              const qty = cartQty[key] || 0;
              const outOfStock = p.stock === 0;
              return (
                <div key={key} className="col-xl-5th col-lg-3 col-md-4 col-6">
                  <div className="prod-card">
                    {outOfStock && <span className="out-badge">Out of Stock</span>}
                    <img src={getImage(p.img)} alt={p.name} className="prod-img" />
                    <div style={{ padding: "10px 12px 12px" }}>
                      <div className="unit-badge">{p.unit}</div>
                      <div className="prod-name">{p.name}</div>
                      {qty > 0 && (() => {
                        const match = p.unit?.match(/([\d.]+)\s*(kg|gm|g|pc|pcs|ltr|ml)/i);
                        if (!match) return <div style={{fontSize:11,color:'#0c831f',fontWeight:600,marginBottom:2}}>{qty} × {p.unit}</div>;
                        const val = parseFloat(match[1]) * qty;
                        const u = match[2].toLowerCase();
                        let display;
                        if (u==='gm'||u==='g') display = val>=1000 ? `${(val/1000).toFixed(2).replace(/\.?0+$/,'')} kg` : `${val} gm`;
                        else if (u==='ml') display = val>=1000 ? `${(val/1000).toFixed(2).replace(/\.?0+$/,'')} ltr` : `${val} ml`;
                        else display = `${val} ${u}`;
                        return <div style={{fontSize:11,color:'#3CB815',fontWeight:600,marginBottom:2}}>{qty} × {p.unit} = {display}</div>;
                      })()}
                      <div className="d-flex justify-content-between align-items-center mt-2">
                        <span className="prod-price">₹{p.price}</span>
                        {!qty ? (
                          <button className="add-btn" onClick={() => !outOfStock && addToCart(p)} disabled={outOfStock}>
                            ADD
                          </button>
                        ) : (
                          <div className="qty-box">
                            <button className="qty-btn" onClick={() => decreaseQty(p)}>−</button>
                            <span className="qty-num">{qty}</span>
                            <button className="qty-btn" onClick={() => increaseQty(p)}>+</button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Cart Bar */}
          {totalItems > 0 && (
            <div className="cart-bar">
              <div>
                <span style={{ fontSize: 15, fontWeight: 700 }}>{totalItems} item{totalItems > 1 ? "s" : ""} added</span>
              </div>
              <button className="cart-bar-btn" onClick={() => navigate("/cart")}>
                View Cart →
              </button>
            </div>
          )}

        </div>
      </div>
    </>
  );
};

export default Products;
