import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CheckoutStepper from "../components/CheckoutStepper";
import { apiFetch } from "../utils/apiFetch";
import { useToast } from "../Context/ToastContext";

const Cart = ({ cartQty, setCartQty }) => {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    apiFetch("/manage-products")
      .then(res => res.json())
      .then(data => setProducts(Array.isArray(data) ? data : []))
      .catch(err => console.error("Products fetch error:", err));
  }, []);

  const cartKey = (id, unit) => `${id}_${unit}`;

  const increaseQty = async (p) => {
    const key = cartKey(p.id, p.unit);
    const currentQty = cartQty[key] || 0;
    if (currentQty >= p.stock) { showToast("Not in stock", "warning"); return; }
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
    const key = cartKey(p.id, p.unit);
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

  const getTotalQty = (unit, qty) => {
    const match = unit?.match(/([\d.]+)\s*(kg|gm|g|pc|pcs|ltr|ml)/i);
    if (!match) return `${qty} × ${unit}`;
    const val = parseFloat(match[1]) * qty;
    const u = match[2].toLowerCase();
    if (u === "gm" || u === "g") return val >= 1000 ? `${(val / 1000).toFixed(2).replace(/\.?0+$/, "")} kg` : `${val} gm`;
    if (u === "ml") return val >= 1000 ? `${(val / 1000).toFixed(2).replace(/\.?0+$/, "")} ltr` : `${val} ml`;
    return `${val} ${u}`;
  };

  const cartItems = products
    .filter(p => cartQty[cartKey(p.id, p.unit)] > 0)
    .map(p => ({ ...p, qty: cartQty[cartKey(p.id, p.unit)] }));

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  const itemCount = cartItems.reduce((acc, item) => acc + item.qty, 0);
  const deliveryCharge = subtotal >= 1000 ? 0 : 70;
  const gst = subtotal * 0.05;
  const discount = subtotal >= 1500 ? subtotal * 0.1 : 0;
  const total = subtotal + deliveryCharge + gst - discount;

  useEffect(() => {
    localStorage.setItem("cartSubtotal", subtotal);
    localStorage.setItem("cartItemCount", itemCount);
    localStorage.setItem("cartItems", JSON.stringify(
      cartItems.map(p => ({ productId: p.id, productName: p.name, price: p.price, quantity: p.qty, unit: p.unit, img: p.img || "" }))
    ));
  }, [subtotal, itemCount, cartItems]);

  const handleCheckout = () => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const role = localStorage.getItem("role");
    if (!isLoggedIn) { navigate("/login", { state: { from: "/select-address" } }); return; }
    if (role !== "customer") { alert("Please login as Customer"); return; }
    navigate("/select-address");
  };

  return (
    <>
      <style>{`
        .cart-page { background: #f3f3f7; min-height: 100vh; padding: 90px 0 40px; }
        .cart-left { background: #fff; border-radius: 16px; padding: 20px; }
        .cart-item { display: flex; align-items: center; gap: 16px; padding: 14px 0; border-bottom: 1px solid #f0f0f0; }
        .cart-item:last-child { border-bottom: none; }
        .cart-item-img { width: 80px; height: 80px; object-fit: cover; border-radius: 12px; background: #f5f5f5; flex-shrink: 0; }
        .cart-item-name { font-size: 15px; font-weight: 700; color: #1a1a1a; margin-bottom: 2px; }
        .cart-item-unit { font-size: 12px; color: #888; margin-bottom: 4px; }
        .cart-item-total-qty { font-size: 12px; color: #3CB815; font-weight: 600; }
        .cart-item-price { font-size: 15px; font-weight: 800; color: #1a1a1a; }
        .qty-ctrl { display: flex; align-items: center; background: #3CB815; border-radius: 8px; overflow: hidden; }
        .qty-ctrl button { background: transparent; border: none; color: #fff; font-size: 18px; font-weight: 700; padding: 3px 10px; cursor: pointer; line-height: 1; }
        .qty-ctrl span { color: #fff; font-weight: 700; font-size: 14px; min-width: 26px; text-align: center; }
        .cart-right { background: #fff; border-radius: 16px; padding: 20px; position: sticky; top: 90px; }
        .bill-row { display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 10px; color: #444; }
        .bill-row.total { font-size: 16px; font-weight: 800; color: #1a1a1a; }
        .bill-row.savings { color: #3CB815; font-weight: 600; }
        .checkout-btn { background: #3CB815; color: #fff; border: none; border-radius: 10px; width: 100%; padding: 13px; font-size: 16px; font-weight: 700; cursor: pointer; margin-top: 16px; transition: background 0.2s; }
        .checkout-btn:hover { background: #2ea010; }
        .empty-cart { text-align: center; padding: 60px 20px; background: #fff; border-radius: 16px; }
        .delivery-badge { background: #e8f5e9; color: #2e7d32; border-radius: 8px; padding: 8px 14px; font-size: 13px; font-weight: 600; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
        .section-title { font-size: 18px; font-weight: 800; color: #1a1a1a; margin-bottom: 16px; }
      `}</style>

      <div className="cart-page" style={{paddingTop:100}}>
        <div className="container">
          <CheckoutStepper />
          

          {cartItems.length === 0 ? (
            <div className="empty-cart">
              <div style={{ fontSize: 60 }}>🛒</div>
              <h4 style={{ fontWeight: 800, marginTop: 16 }}>Your cart is empty</h4>
              <p style={{ color: "#888" }}>Add items to get started</p>
              <button
                onClick={() => navigate("/products")}
                style={{ background: "#3CB815", color: "#fff", border: "none", borderRadius: 10, padding: "10px 28px", fontWeight: 700, fontSize: 15, cursor: "pointer", marginTop: 12 }}
              >
                Shop Now
              </button>
            </div>
          ) : (
            <div className="row g-4">

              {/* LEFT — Cart Items */}
              <div className="col-lg-8">
                <div className="cart-left">
                  <div className="section-title">🛒 My Cart ({itemCount} items)</div>

                  {deliveryCharge === 0 ? (
                    <div className="delivery-badge">🚚 Free delivery on this order!</div>
                  ) : (
                    <div className="delivery-badge" style={{ background: "#fff8e1", color: "#f57f17" }}>
                      🚚 Add Rs.{(1000 - subtotal).toFixed(0)} more for FREE delivery
                    </div>
                  )}

                  {cartItems.map(item => (
                    <div key={cartKey(item.id, item.unit)} className="cart-item">
                      <img src={item.img} alt={item.name} className="cart-item-img" />

                      <div style={{ flex: 1 }}>
                        <div className="cart-item-name">{item.name}</div>
                        <div className="cart-item-unit">{item.unit}</div>
                        <div className="cart-item-total-qty">{getTotalQty(item.unit, item.qty)}</div>
                        <div className="cart-item-price">₹{item.price} <span style={{ fontSize: 12, color: "#888", fontWeight: 400 }}>per {item.unit}</span></div>
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                        <div className="qty-ctrl">
                          <button onClick={() => decreaseQty(item)}>−</button>
                          <span>{item.qty}</span>
                          <button onClick={() => increaseQty(item)}>+</button>
                        </div>
                        <div style={{ fontSize: 15, fontWeight: 800, color: "#1a1a1a" }}>₹{(item.price * item.qty).toFixed(2)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* RIGHT — Bill Summary */}
              <div className="col-lg-4">
                <div className="cart-right">
                  <div className="section-title">Bill Details</div>

                  <div className="bill-row"><span>MRP Total</span><span>₹{subtotal.toFixed(2)}</span></div>
                  <div className="bill-row"><span>Delivery Charge</span><span style={{ color: deliveryCharge === 0 ? "#3CB815" : "#1a1a1a" }}>{deliveryCharge === 0 ? "FREE" : `₹${deliveryCharge}`}</span></div>
                  <div className="bill-row"><span>GST (5%)</span><span>₹{gst.toFixed(2)}</span></div>
                  {discount > 0 && (
                    <div className="bill-row savings"><span>Discount (10%)</span><span>− ₹{discount.toFixed(2)}</span></div>
                  )}
                  <hr style={{ margin: "12px 0" }} />
                  <div className="bill-row total"><span>Grand Total</span><span>₹{total.toFixed(2)}</span></div>

                  {discount > 0 && (
                    <div style={{ background: "#e8f5e9", borderRadius: 8, padding: "8px 12px", fontSize: 13, color: "#2e7d32", fontWeight: 600, marginTop: 10 }}>
                      🎉 You're saving ₹{discount.toFixed(2)} on this order!
                    </div>
                  )}

                  <button className="checkout-btn" onClick={handleCheckout}>
                    Continue →
                  </button>

                  <div style={{ textAlign: "center", marginTop: 12, fontSize: 12, color: "#aaa" }}>
                    🔒 Safe & Secure Payments
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Cart;
