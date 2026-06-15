import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastProvider } from "./Context/ToastContext";
import ScrollToTop from "./pages/ScrollToTop";

import Header from "./components/Header";
import Footer from "./components/Footer";
import CheckoutStepper from "./components/CheckoutStepper";
import CommonTable from "./components/CommonTable";

import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Feature from "./pages/Feature";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyOtp from "./pages/VerifyOtp";

import Products from "./pages/Products";
import Cart from "./pages/Cart";
import SelectAddress from "./pages/SelectAddress";
import Payment from "./pages/Payment";
import Summary from "./pages/Summary";
import OrderSuccess from "./pages/OrderSuccess";

import Profile from "./pages/Profile";
import Orders from "./pages/Orders";
import OrderDetails from "./pages/OrderDetails";
import CustomerDashboard from "./pages/dashboard/CustomerDashboard";
import CustPayment from "./pages/CustPayment";

import DeliveryDashboard from "./pages/dashboard/DeliveryDashboard";
import AssignedOrder from "./pages/AssignedOrder";
import Earnings from "./pages/Earnings";
import AgentProfile from "./pages/AgentProfile";
import Withdraw from "./pages/Withdraw";
import OrderCompleted from "./pages/OrderCompleted";

import AdminDashboard from "./pages/dashboard/AdminDashboard";
import Users from "./pages/Users";
import ManageProducts from "./pages/ManageProducts";
import Report from "./pages/Report";
import ViewOrders from "./pages/ViewOrders";
import ViewContact from "./pages/viewContact";
import ViewSupport from "./pages/ViewSupport";

import Team from "./pages/Team";
import Agent from "./pages/Agent";
import AgentWallet from "./pages/AgentWallet";
import AdminWithdraw from "./pages/AdminWithdraw";
import Support from "./pages/Support";
import Faqs from "./pages/Faqs";

/* ---------------- LAYOUT WRAPPER ---------------- */

function LayoutWrapper({ role, setRole, cartQty, setCartQty, products }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Header
        role={role}
        isLoggedIn={role !== "guest"}
        setRole={setRole}
        cartQty={cartQty}
        totalAmounts={products}
      />

      <ScrollToTop />

      <div style={{ flex: 1 }}>
        <Routes>

          {/* ---------------- GUEST ROUTES ---------------- */}

          <Route path="/" element={<Home cartQty={cartQty} setCartQty={setCartQty} />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/feature" element={<Feature />} />
          <Route path="/login" element={<Login setRole={setRole} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-Otp" element={<VerifyOtp />} />
          <Route path="/team" element={<Team />} />

          {/* ---------------- CUSTOMER ROUTES ---------------- */}

          <Route path="/customer-dashboard" element={<CustomerDashboard />} />
          <Route path="/products" element={<Products cartQty={cartQty} setCartQty={setCartQty} />} />
          <Route path="/cart" element={<Cart cartQty={cartQty} setCartQty={setCartQty} />} />
          <Route path="/select-address" element={<SelectAddress />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/summary" element={<Summary />} />
          <Route path="/cust-payment" element={<CustPayment />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/order-details/:id" element={<OrderDetails />} />
          <Route path="/order-success" element={<OrderSuccess setCartQty={setCartQty} />} />

          {/* ---------------- DELIVERY ROUTES ---------------- */}

          <Route path="/delivery-dashboard" element={<DeliveryDashboard />} />
          <Route path="/delivery/assigned-orders" element={<AssignedOrder />} />
          <Route path="/delivery/earnings" element={<Earnings />} />
          <Route path="/delivery/agent-profile" element={<AgentProfile />} />
          <Route path="/withdraw" element={<Withdraw />} />
          <Route path="/agent" element={<Agent />} />
          <Route path="/agent-wallet" element={<AgentWallet />} />
          <Route path="/admin-withdraw" element={<AdminWithdraw />} />
          <Route path="/delivery/order-completed" element={<OrderCompleted />} />

          {/* ---------------- ADMIN ROUTES ---------------- */}

          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/users" element={<Users />} />
          <Route path="/manageproducts" element={<ManageProducts />} />
          <Route path="/report" element={<Report />} />
          <Route path="/view-orders" element={<ViewOrders />} />
          <Route path="/view-contact" element={<ViewContact />} />
          <Route path="/view-support" element={<ViewSupport />} />
          <Route path="/commontable" element={<CommonTable />} />

          <Route path="/checkout-stepper" element={<CheckoutStepper />} />


          {/* ---------------- SUPPORT ---------------- */}

          <Route path="/support" element={<Support />} />
          <Route path="/faqs" element={<Faqs />} />

          {/* ---------------- FALLBACK ---------------- */}

          <Route path="*" element={<Login setRole={setRole} />} />

        </Routes>
      </div>

      <Footer />
      
      {/* WhatsApp Button - Visible only for guest and customer */}
      {['guest', 'customer'].includes(role) && (
        <a
          href="https://wa.me/919104427875?text=Hello%20I%20want%20to%20inquire%20about%20your%20products"
          className="whatsapp-float"
          target="_blank"
          rel="noopener noreferrer"
        >
          <i className="bi bi-whatsapp"></i>
        </a>
      )}
    </div>
  );
}

/* ---------------- APP ---------------- */

function App() {

  const [cartQty, setCartQty] = useState(() => {
    const saved = localStorage.getItem("cartQty");
    return saved ? JSON.parse(saved) : {};
  });

  const [role, setRole] = useState("guest");

  useEffect(() => {
    localStorage.setItem("cartQty", JSON.stringify(cartQty));
  }, [cartQty]);

  return (
    <ToastProvider>
      <BrowserRouter>
        <LayoutWrapper
          role={role}
          setRole={setRole}
          cartQty={cartQty}
          setCartQty={setCartQty}
        />
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;