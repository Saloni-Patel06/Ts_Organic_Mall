import React from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../utils/apiFetch.js';

const PaymentButton = ({ amount, orderData, onPaymentSuccess, buttonText = "Pay Now Securely" }) => {
  const navigate = useNavigate();

  const handlePayment = async () => {
    try {
      // 1. Store orderData in localStorage for verify callback
      localStorage.setItem('pendingOrderData', JSON.stringify(orderData));

      // 2. Create Razorpay Order
      const orderRes = await apiFetch("/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount: parseInt(amount) }),
      });

      if (!orderRes.ok) {
        throw new Error('Failed to create order');
      }

      const orderDataResponse = await orderRes.json();
      const order = orderDataResponse.order;

      const options = {
        key: "rzp_test_SU9OILjNd5mGst", // From backend middleware
        amount: order.amount * 100, // Ensure paise
        currency: "INR",
        name: "TS Organic Mall",
        // image: "/img/logotsrazorpay.png",
        description: `Order Payment - Rs. ${amount}`,
        order_id: order.id,
        prefill: {
          name: orderData.customerName || "Customer",
          email: orderData.customerEmail || "",
          contact: orderData.mobile || "",
        },
        theme: {
          color: "#33cc388a",
        },
        handler: async function (response) {
          try {
            // 3. Verify Payment + send full orderData
            const pendingOrderData = localStorage.getItem('pendingOrderData');
            const fullOrderData = pendingOrderData ? JSON.parse(pendingOrderData) : orderData;

            const verifyRes = await apiFetch(
              "/verify-payment",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  ...response,
                  orderData: fullOrderData,
                }),
              }
            );

            const verifyData = await verifyRes.json();

            if (verifyData.success) {
              // Clear cart
              const userId = localStorage.getItem('userId');
              if (userId) {
                await apiFetch(`/cart/clear/${userId}`, { method: "DELETE" });
              }
              
              localStorage.removeItem('pendingOrderData');
              localStorage.removeItem('cartQty');
              localStorage.removeItem('cartSubtotal');
              localStorage.removeItem('cartItemCount');
              
              alert("Payment Successful ✅ Order Confirmed!");
              
              if (onPaymentSuccess) {
                onPaymentSuccess(verifyData.orderId);
              } else {
                navigate('/order-success');
              }
            } else {
              alert("Payment Failed ❌: " + (verifyData.message || 'Unknown error'));
            }
          } catch (verifyError) {
            console.error("Payment verification failed:", verifyError);
            alert("Payment processing failed. Please try again.");
          }
        },
        modal: {
          ondismiss: function() {
            localStorage.removeItem('pendingOrderData');
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Payment Error:", err);
      alert("Payment initialization failed. Please try again.");
    }
  };

  return (
    <button
      onClick={handlePayment}
      className="btn btn-primary w-100 py-2 fw-bold rounded-pill shadow-sm"
      style={{ fontSize: '0.95rem', border: 'none' }}
    >
      <i className="fas fa-lock me-2"></i>
      {buttonText} 
      <span className="ms-2">Rs. {amount.toLocaleString()}</span>
    </button>
  );
};

export default PaymentButton;
