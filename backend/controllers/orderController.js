const { getDB } = require('../config/db');
const razorpay = require('../middleware/razorpay.js');
const { ObjectId } = require('mongodb');
const generateOTP = require("../utils/otp");
const sendEmail = require("../utils/sendEmail");

const getOrders = async (req, res, next) => {
  try {
    const db = getDB();

    // console.log("Logged in user:", req.user);

    let filter = {};

    if (req.user.role === "customer") {
      // ✅ AUTO FETCH CUSTOMER ORDERS
      filter = { customerId: req.user._id.toString() };
    }
    else if (req.user.role === "agent") {
      // ✅ AGENT ORDERS
      filter = { agentId: req.user._id.toString() };
    }

    const orders = await db.collection("orders")
      .find({ ...filter, items: { $exists: true, $not: { $size: 0 } }, totalAmount: { $exists: true } })
      .sort({ createdAt: -1 })
      .toArray();

    res.json(orders);

  } catch (error) {
    next(error);
  }
};
const getOrderById = async (req, res, next) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid Order ID" });
    }

    const db = getDB();
    const order = await db.collection("orders").findOne({ _id: new ObjectId(req.params.id) });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({
      id: order._id.toString(),
      customerId: order.customerId,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      agentId: order.agentId || null,
      agentName: order.agentName || null,
      mobile: order.mobile || null,
      items: order.items,
      subtotal: order.subtotal || 0,
      deliveryCharge: order.deliveryCharge || 0,
      gst: order.gst || 0,
      discount: order.discount || 0,
      totalAmount: order.totalAmount,
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      deliveryAddress: order.deliveryAddress,
      scheduledDate: order.scheduledDate || null,
      timeSlot: order.timeSlot || null,
      createdAt: order.createdAt
    });

  } catch (error) {
    next(error);
  }
};


const createOrder = async (req, res, next) => {
  try {
    const db = getDB();

    const customerId = req.user._id.toString();

    const newOrder = {
      customerId,
      customerName: req.body.customerName,
      customerEmail: req.body.customerEmail,

      items: req.body.items || [],

      subtotal: req.body.subtotal || 0,
      deliveryCharge: req.body.deliveryCharge || 0,
      gst: req.body.gst || 0,
      discount: req.body.discount || 0,
      totalAmount: req.body.totalAmount || 0,

      status: "Pending",

      paymentStatus: req.body.paymentStatus || "Pending",
      paymentMethod: req.body.paymentMethod || "online",

      deliveryAddress: req.body.deliveryAddress || "",

      scheduledDate: req.body.scheduledDate || null,
      timeSlot: req.body.timeSlot || null,

      agentId: null,
      agentName: null,
      mobile: null,

      createdAt: new Date()
    };

    const result = await db.collection("orders").insertOne(newOrder);

    res.status(201).json({
      message: "Order created successfully",
      id: result.insertedId.toString()
    });

  } catch (error) {
    next(error);
  }
};
/* ================= UPDATE ORDER ================= */
const updateOrder = async (req, res, next) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid Order ID" });
    }

    const db = getDB();

    // Only update provided fields
    const updateFields = {};
    if (req.body.status !== undefined) updateFields.status = req.body.status;
    if (req.body.failReason !== undefined) updateFields.failReason = req.body.failReason;
    if (req.body.customerId !== undefined) updateFields.customerId = req.body.customerId;
    if (req.body.customerName !== undefined) updateFields.customerName = req.body.customerName;
    if (req.body.customerEmail !== undefined) updateFields.customerEmail = req.body.customerEmail;
    if (req.body.items !== undefined) updateFields.items = req.body.items;
    if (req.body.subtotal !== undefined) updateFields.subtotal = req.body.subtotal;
    if (req.body.deliveryCharge !== undefined) updateFields.deliveryCharge = req.body.deliveryCharge;
    if (req.body.gst !== undefined) updateFields.gst = req.body.gst;
    if (req.body.discount !== undefined) updateFields.discount = req.body.discount;
    if (req.body.totalAmount !== undefined) updateFields.totalAmount = req.body.totalAmount;
    if (req.body.paymentStatus !== undefined) updateFields.paymentStatus = req.body.paymentStatus;
    if (req.body.paymentMethod !== undefined) updateFields.paymentMethod = req.body.paymentMethod;
    if (req.body.agentId !== undefined) updateFields.agentId = req.body.agentId;
    if (req.body.deliveryAddress !== undefined) updateFields.deliveryAddress = req.body.deliveryAddress;
    if (req.body.scheduledDate !== undefined) updateFields.scheduledDate = req.body.scheduledDate;
    if (req.body.timeSlot !== undefined) updateFields.timeSlot = req.body.timeSlot;
    updateFields.updatedAt = new Date();

    const result = await db.collection("orders").updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: updateFields }
    );



    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ message: "Order updated successfully" });

  } catch (error) {
    next(error);
  }
};

/* ================= DELETE ORDER ================= */
const deleteOrder = async (req, res, next) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid Order ID" });
    }

    const db = getDB();
    const result = await db.collection("orders").deleteOne({ _id: new ObjectId(req.params.id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ message: "Order deleted successfully" });
  } catch (error) {
    next(error);
  }
};
/* ================= ASSIGN AGENT ================= */
const assignAgent = async (req, res, next) => {
  try {

    // if (!ObjectId.isValid(req.params.id)) {
    //   return res.status(400).json({ message: "Invalid Order ID" });
    // }

    const db = getDB();

    const { agentId, agentName, mobile } = req.body;

    await db.collection("orders").updateOne(
      { _id: new ObjectId(req.params.id) },
      {
        $set: {
          agentId: agentId?.toString(),
          agentName,
          mobile,
          status: "Assigned",
          updatedAt: new Date()
        }
      }
    );

    res.json({ message: "Agent assigned successfully" });

  } catch (error) {
    next(error);
  }
};

/* ================= UPDATE SCHEDULE ================= */
const updateOrderSchedule = async (req, res, next) => {
  try {
    // if (!ObjectId.isValid(req.params.id)) {
    //   return res.status(400).json({ message: "Invalid Order ID" });
    // }

    const db = getDB();
    const { scheduledDate, timeSlot } = req.body;

    await db.collection("orders").updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { scheduledDate, timeSlot, updatedAt: new Date() } }
    );

    // if (result.matchedCount === 0) {
    //   return res.status(404).json({ message: "Order not found" });
    // }

    res.json({ message: "Order schedule updated successfully" });
  } catch (error) {
    next(error);
  }
};

/* ================= MARK DELIVERED ================= */
const markDelivered = async (req, res, next) => {
  try {
    const db = getDB();

    await db.collection("orders").updateOne(
      { _id: new ObjectId(req.params.id) },
      {
        $set: {
          status: "Delivered",
          deliveredAt: new Date()
        }
      }
    );

    res.json({ message: "Order delivered successfully" });

  } catch (error) {
    next(error);
  }
};

/* ================= PENDING ORDERS ================= */
const getPendingOrdersForAgent = async (req, res, next) => {
  try {

    const db = getDB();

    const orders = await db.collection("orders")
      .find({ status: "Pending" })
      .sort({ createdAt: -1 })
      .toArray();

    res.json(orders);

  } catch (error) {
    next(error);
  }
};

/* ================= AGENT ACCEPT ================= */
const agentAcceptOrder = async (req, res, next) => {
  try {

    // if (!ObjectId.isValid(req.params.id)) {
    //   return res.status(400).json({ message: "Invalid Order ID" });
    // }

    const db = getDB();

    const { agentId, agentName, mobile } = req.body;

    await db.collection("orders").updateOne(
      { _id: new ObjectId(req.params.id) },
      {
        $set: {
          agentId,
          agentName,
          mobile,
          status: "Accepted",
          acceptedAt: new Date()
        }
      }
    );

    res.json({ message: "Order accepted by agent" });

  } catch (error) {
    next(error);
  }
};

/* ================= OUT FOR DELIVERY ================= */
const markOutForDelivery = async (req, res, next) => {
  try {
    const db = getDB();

    await db.collection("orders").updateOne(
      { _id: new ObjectId(req.params.id) },
      {
        $set: {
          status: "Out For Delivery",
          updatedAt: new Date()
        }
      }
    );

    res.json({ message: "Out for delivery" });

  } catch (error) {
    next(error);
  }
};

/* ================= RAZORPAY ================= */
const createRazorpayOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    const razorpayOrder = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: "order_" + Date.now(),
    });

    res.json({
      success: true,
      order: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount / 100,
        currency: razorpayOrder.currency,
      },
    });

  } catch (error) {
    res.status(500).json({ message: "Razorpay error" });
  }
};


// Create Razorpay Order for payment
// const createRazorpayOrder = async (req, res) => {
//   try {
//     const { amount } = req.body;

//     // if (!amount || amount <= 0) {
//     //   return res.status(400).json({ message: "Valid amount is required" });
//     // }

//     const orderOptions = {
//       amount: amount * 100, // Razorpay expects paise
//       currency: "INR",
//       receipt: "order_" + Date.now(),
//     };

//     const razorpayOrder = await razorpay.orders.create(orderOptions);

//     res.json({
//       success: true,
//       order: {
//         id: razorpayOrder.id,
//         amount: razorpayOrder.amount / 100, // Convert back to rupees
//         currency: razorpayOrder.currency,
//       },
//     });
//   } catch (error) {
//     console.error("Razorpay order creation error:", error);
//     res.status(500).json({ message: "Failed to create Razorpay order" });
//   }
// };

/* ================= DELIVERY OTP ================= */
const generateDeliveryOtp = async (req, res, next) => {
  try {
    const db = getDB();
    const orderId = req.params.id;

    if (!ObjectId.isValid(orderId)) {
      return res.status(400).json({ success: false, message: "Invalid Order ID" });
    }

    const order = await db.collection("orders").findOne({ 
      _id: new ObjectId(orderId),
      status: { $in: ["Out For Delivery", "Out for Delivery"] },
      $or: [
        { customerEmail: { $exists: true, $nin: ["", null] } },
        { mobile: { $exists: true, $nin: ["", null] } }
      ]
    });

    if (!order) {
      console.log("Order check failed:", { orderId, statusCheck: "Out For Delivery", hasEmail: !!order?.customerEmail, hasMobile: !!order?.mobile });
      return res.status(404).json({ success: false, message: "Order must be 'Out For Delivery' with customer email/mobile" });
    }

    if (order.deliveryOtp) {
      return res.status(400).json({ success: false, message: "Delivery OTP already generated" });
    }

    // Generate OTP + 10min expiry
    const otp = generateOTP();
    const otpExpires = Date.now() + 10 * 60 * 1000;

    // Save to order
    await db.collection("orders").updateOne(
      { _id: new ObjectId(orderId) },
      { 
        $set: { 
          deliveryOtp: otp,
          deliveryOtpExpires: otpExpires,
          updatedAt: new Date()
        }
      }
    );

    // Send email to customer
    const toEmail = order.customerEmail || `${order.customerName || 'Customer'} <${order.mobile}@sms.tsorganicmall.com>`;
    await sendEmail(
      toEmail,
      "Order Delivered - Confirm Receipt 📦 | TS Organic Mall",
      `
      <div style="font-family: Arial, sans-serif; background:#f6f9fc; padding:20px;">
        <div style="max-width:600px; margin:auto; background:#ffffff; border-radius:10px; overflow:hidden; box-shadow:0 5px 15px rgba(0,0,0,0.1);">
          <div style="background:#16a34a; color:#fff; padding:20px; text-align:center;">
            <h2 style="margin:0;">🎉 Order Delivered Successfully!</h2>
          </div>
          <div style="padding:30px; text-align:center;">
            <h3>Your agent has delivered Order #${orderId} to ${order.customerName || 'you'}</h3>
            <p style="color:#666; font-size:16px;">Please confirm by sharing this OTP with your delivery agent:</p>
            <div style="font-size:48px; font-weight:bold; letter-spacing:12px; color:#16a34a; background:#f0fdf4; padding:25px; border-radius:15px; margin:25px 0; box-shadow:0 4px 12px rgba(22,163,74,0.2);">
              ${otp}
            </div>
            <p style="color:#16a34a; font-weight:500;"><strong>Valid for 10 minutes only</strong></p>
            <hr style="border:0; height:1px; background:#e5e7eb; margin:30px 0;">
            <p style="color:#666; font-size:14px;">This ensures secure delivery confirmation.</p>
          </div>
          <div style="background:#f9fafb; padding:20px; text-align:center; font-size:12px; color:#999;">
            © ${new Date().getFullYear()} TS Organic Mall | Safe & Organic Deliveries
          </div>
        </div>
      </div>
      `
    );

    res.json({ 
      success: true, 
      message: "Delivery OTP generated and sent to customer" 
    });

  } catch (error) {
    next(error);
  }
};

const verifyDeliveryOtp = async (req, res, next) => {
  try {
    const db = getDB();
    const orderId = req.params.id;
    const { otp } = req.body;

    if (!ObjectId.isValid(orderId)) {
      return res.status(400).json({ success: false, message: "Invalid Order ID" });
    }

    if (!otp) {
      return res.status(400).json({ success: false, message: "OTP required" });
    }

    const order = await db.collection("orders").findOne({ _id: new ObjectId(orderId) });

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (!["Out For Delivery", "Out for Delivery"].includes(order.status)) {
      console.log("Verify status check failed:", order.status);
      return res.status(400).json({ success: false, message: "Order must be Out For Delivery for OTP verification" });
    }

    console.log("Verify OTP debug:", { orderDeliveryOtp: order.deliveryOtp, inputOtp: otp, status: order.status });
    if (order.deliveryOtp !== otp) {
      return res.status(400).json({ success: false, message: `Invalid delivery OTP. Expected: ${order.deliveryOtp}, Got: ${otp}` });
    }

    if (Date.now() > order.deliveryOtpExpires) {
      return res.status(400).json({ success: false, message: "Delivery OTP expired" });
    }

    // Mark delivered + clear OTP
    await db.collection("orders").updateOne(
      { _id: new ObjectId(orderId) },
      {
        $set: {
          status: "Delivered",
          deliveredAt: new Date(),
          updatedAt: new Date()
        },
        $unset: {
          deliveryOtp: "",
          deliveryOtpExpires: ""
        }
      }
    );

    // ✅ AUTO CREDIT AGENT WALLET on delivery (Rs.70 fee)
    if (order.agentId) {
      const agentObjId = new ObjectId(order.agentId);
      const deliveryFee = 70;
      
      await db.collection("wallets").updateOne(
        { agentId: agentObjId },
        {
          $inc: { 
            balance: deliveryFee, 
            totalEarnings: deliveryFee 
          },
          $push: {
            transactions: {
              date: new Date(),
              type: "Credit",
              amount: deliveryFee,
              description: `Order ${orderId} Delivered`
            }
          }
        },
        { upsert: true }
      );
    }

    res.json({ 
      success: true, 
      message: "Delivery confirmed! Wallet credited." 
    });

  } catch (error) {
    next(error);
  }
};

const cancelOrder = async (req, res, next) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid Order ID" });
    }

    const db = getDB();
    const order = await db.collection("orders").findOne({ _id: new ObjectId(req.params.id) });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // ❌ Block cancel if already picked
    const blockedStatuses = ["Accepted", "Out For Delivery", "Delivered", "Cancelled"];
    if (blockedStatuses.includes(order.status)) {
      return res.status(400).json({ message: "Cancellation not allowed after pickup started" });
    }

    const total = order.totalAmount || 0;
    const refundAmount = Math.floor(total * 0.8);
    const adminFee = total - refundAmount;

    let refund = null;

    // ✅ Razorpay refund (ONLY for online payments)
    if (
      order.paymentMethod === "online" &&
      order.razorpayOrderId &&
      order.razorpayPaymentId
    ) {
      const refundOptions = {
        razorpay_order_id: order.razorpayOrderId,
        razorpay_payment_id: order.razorpayPaymentId,
        amount: refundAmount * 100,
      };

      refund = await razorpay.refunds.create(refundOptions);
      console.log("Razorpay Refund:", refund);
    }

    // ✅ Payment object update
    const payment = order.payment || {};
    payment.totalAmount = total;
    payment.refundAmount = refundAmount;
    payment.adminFee = adminFee;
    payment.refundStatus = "Completed";
    payment.razorpayRefundId = refund ? refund.id : null;

    // ✅ Update order
    await db.collection("orders").updateOne(
      { _id: new ObjectId(req.params.id) },
      {
        $set: {
          status: "Cancelled",
          payment,
          updatedAt: new Date(),
          cancelledAt: new Date()
        }
      }
    );

    // ✅ Update payments collection
    await db.collection("payments").updateOne(
      { orderId: order._id },
      {
        $set: {
          refundStatus: "Completed",
          refundAmount: refundAmount
        }
      }
    );

    // ✅ Wallet refund ONLY for COD / wallet payments
    if (order.paymentMethod !== "online") {
      const walletQuery = {
        $or: [
          { customerId: order.customerId },
          { customerName: order.customerName }
        ]
      };

      await db.collection("wallets").updateOne(
        walletQuery,
        {
          $inc: { balance: refundAmount },
          $push: {
            transactions: {
              date: new Date(),
              description: `Order ${req.params.id} Cancel Refund`,
              type: "Credit",
              amount: refundAmount
            }
          }
        },
        { upsert: true }
      );
    }

    // ✅ Store admin revenue
    await db.collection("adminRevenue").insertOne({
      orderId: order._id,
      amount: adminFee,
      type: "Cancellation Fee",
      createdAt: new Date()
    });

    res.json({
      message: "Order cancelled successfully",
      refundAmount,
      adminFee,
      newStatus: "Cancelled"
    });

  } catch (error) {
    console.error("Cancel error:", error);
    next(error);
  }
};

module.exports = {
  getOrders,
  getOrderById,
  createOrder,
  createRazorpayOrder,
  updateOrder,
  deleteOrder,
  updateOrderSchedule,
  assignAgent,
  markDelivered,
  getPendingOrdersForAgent,
  agentAcceptOrder,
  markOutForDelivery,
  generateDeliveryOtp,
  verifyDeliveryOtp,
  cancelOrder
};
