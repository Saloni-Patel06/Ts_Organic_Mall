const crypto = require("crypto");
const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');
const sendEmail = require("../utils/sendEmail");

const verifyPaymentStatus = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderData } = req.body;

    const expectedSignature = crypto
      .createHmac("sha256", "JwAYo6QQvvn0NRDV4vehC52U")
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Invalid signature" });
    }

    if (!orderData) {
      return res.status(400).json({ success: false, message: "Order data required" });
    }

    const db = getDB();

    const fullOrderData = {
      customerId: orderData.customerId?.toString() || "",
      customerName: orderData.customerName || "",
      customerEmail: orderData.customerEmail || "",
      items: orderData.items || [],
      subtotal: Number(orderData.subtotal) || 0,
      deliveryCharge: Number(orderData.deliveryCharge) || 0,
      gst: Number(orderData.gst) || 0,
      discount: Number(orderData.discount) || 0,
      totalAmount: Number(orderData.orderTotal || orderData.totalAmount) || 0,
      deliveryAddress: orderData.selectedAddress || orderData.deliveryAddress || "",
      scheduledDate: orderData.scheduledDate || "",
      timeSlot: orderData.timeSlot || "",
      status: "Pending",
      paymentStatus: "Paid",
      paymentMethod: "razorpay",
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      agentId: null,
      agentName: null,
      createdAt: new Date()
    };

    const result = await db.collection("orders").insertOne(fullOrderData);

    // Save to payments collection
    await db.collection("payments").insertOne({
      orderId: result.insertedId,
      customerName: fullOrderData.customerName,
      customerEmail: fullOrderData.customerEmail,
      customerId: fullOrderData.customerId,
      product: fullOrderData.items?.map(i => i.productName || i.name).join(", ") || "N/A",
      amount: fullOrderData.totalAmount,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      paymentMethod: "Razorpay",
      paymentStatus: "Paid",
      createdAt: new Date()
    });

    // ✅ Send order confirmation email
    try {
      await sendEmail(
        fullOrderData.customerEmail,
        "✅ Order Confirmed | TS Organic Mall",
        `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa; padding: 20px;">
          <div style="background: linear-gradient(135deg, #16a34a, #22c55e); color: white; padding: 30px; text-align: center; border-radius: 15px 15px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">🎉 Order Confirmed!</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Order #${result.insertedId.toString()}</p>
          </div>
          <div style="background: white; padding: 30px; border-radius: 0 0 15px 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
            <h3 style="color: #1f2937; margin-bottom: 20px;">Dear ${fullOrderData.customerName},</h3>
            
            <p style="color: #4b5563; line-height: 1.6;">Your order has been confirmed and payment received successfully! Thank you for shopping at <strong>TS Organic Mall</strong>.</p>

            <div style="background: #f8fafc; padding: 20px; border-radius: 10px; margin: 25px 0;">
              <h4 style="margin: 0 0 15px 0; color: #1f2937;">Order Summary</h4>
              <table style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr style="background: #e0e7ff;">
                    <th style="padding: 12px; text-align: left; font-weight: 600; color: #076414;">Item</th>
                    <th style="padding: 12px; text-align: right; font-weight: 600; color: #076414;">Qty</th>
                    <th style="padding: 12px; text-align: right; font-weight: 600; color: #076414;">Price</th>
                    <th style="padding: 12px; text-align: right; font-weight: 600; color: #076414;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${fullOrderData.items.map(item => `
                    <tr style="border-bottom: 1px solid #e5e7eb;">
                      <td style="padding: 12px; font-weight: 500;">${item.productName || item.name}</td>
                      <td style="padding: 12px; text-align: right;">${item.quantity}</td>
                      <td style="padding: 12px; text-align: right;">Rs. ${item.price}</td>
                      <td style="padding: 12px; text-align: right; font-weight: 600;">Rs. ${(item.quantity * item.price).toFixed(2)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
              <div style="margin-top: 15px; padding-top: 15px; border-top: 2px solid #16a34a;">
                <div style="display: flex; justify-content: space-between; font-size: 16px;">
                  <span>Total Amount:</span>
                  <span style="font-weight: 700; color: #16a34a;">Rs. ${fullOrderData.totalAmount}</span>
                </div>
              </div>
            </div>

            <div style="background: #fef3c7; padding: 20px; border-radius: 12px; text-align: center; margin: 25px 0;">
              <h4 style="color: #92400e; margin: 0 0 10px 0;">📅 Delivery Schedule</h4>
              <p style="margin: 0; color: #a16207; font-size: 16px; font-weight: 600;">
                ${fullOrderData.scheduledDate ? new Date(fullOrderData.scheduledDate).toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'ASAP'}
                ${fullOrderData.timeSlot ? ` | ${fullOrderData.timeSlot}` : ''}
              </p>
            </div>

            <div style="background: #dbeafe; padding: 20px; border-radius: 12px; text-align: center;">
              <h4 style="color: #1e40af; margin: 0 0 10px 0;">📱 Track Your Order</h4>
              <p style="margin: 0; color: #1e1b4b; font-size: 14px;">Check status anytime in <strong>My Orders</strong></p>
            </div>

            <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
              We'll notify you when your order is ready for pickup or delivery.
              <br /><br />
              Happy shopping with <strong>TS Organic Mall</strong>!
            </p>

            <div style="margin-top: 30px; padding: 20px; background: #f8fafc; border-radius: 10px; font-size: 12px; color: #6b7280;">
              <strong>TS Organic Mall</strong> | Fresh from Farm • Organic Certified | support@tsorganicmall.com
            </div>
          </div>
        </div>
        `
      );
      console.log("Order confirmation email sent to", fullOrderData.customerEmail);
    } catch (emailErr) {
      console.error("Confirmation email failed:", emailErr);
    }

    res.json({
      success: true,
      message: "Payment verified & order created",
      orderId: result.insertedId.toString()
    });

  } catch (error) {
    console.error("Payment verification error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


const getPaymentStatus = async (req, res) => {
  try {
    const { orderId, razorpay_order_id } = req.query;
    const db = getDB();
    let query = {};
    if (orderId) query._id = new ObjectId(orderId);
    else if (razorpay_order_id) query.razorpayOrderId = razorpay_order_id;
    else return res.status(400).json({ success: false, message: "orderId or razorpay_order_id is required" });

    const order = await db.collection("orders").findOne(query);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};


const getAllPayments = async (req, res) => {
  try {
    const db = getDB();
    const payments = await db.collection("payments").find({}).sort({ createdAt: -1 }).toArray();
    for (const payment of payments) {
      const adminEarnings = await db.collection("adminRevenue").find({ orderId: payment.orderId }).toArray();
      payment.adminFee = adminEarnings.reduce((sum, earning) => sum + (earning.amount || 0), 0);
    }
    res.status(200).json({ success: true, data: payments });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};


module.exports = { verifyPaymentStatus, getPaymentStatus, getAllPayments };
