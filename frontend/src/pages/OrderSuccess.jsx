import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import confetti from "canvas-confetti";

const OrderSuccess = ({ setCartQty }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const orderData = location.state;
  

  useEffect(() => {
    localStorage.removeItem("cartQty");
    setCartQty({});

    // Single confetti burst on load
    setTimeout(() => {
      confetti({
        particleCount: 400,
        spread: 100,
        origin: { y: 0.6 }
      });
    }, 500);
  }, [setCartQty]);

  return (
    <div className="container text-center mt-5">
      <br /><br /><br /><br /><br />
      <div style={{ fontSize: "80px", cursor: "pointer" }}>
        🎉
      </div>

      <h2 className="text-primary fw-bold mt-3">
        Order Placed Successfully!
      </h2>

      <h5 className="mt-2 text-muted">
        Thank you for shopping with us.
      </h5>

      <button
        className="btn btn-primary mt-4 px-4"
        onClick={() => navigate("/orders", { state: orderData })}
      >
        View My Orders
      </button>
      <br /><br /><br />
    </div>
  );
};

export default OrderSuccess;

