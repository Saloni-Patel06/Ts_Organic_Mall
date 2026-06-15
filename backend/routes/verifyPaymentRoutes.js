const express = require('express');
const router = express.Router();

const verifyPaymentController = require('../controllers/verifyPaymentController');

/**
 * @swagger
 * tags:
 *   name: Verify-Payment
 *   description: Payment verification API
 */

/**
 * @swagger
 * /verify-payment:
 *   post:
 *     summary: Verify payment
 *     tags: [Verify-Payment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties: true
 *           example:
 *             razorpay_order_id: order_123456
 *             razorpay_payment_id: pay_123456
 *             razorpay_signature: abcdef123456
 *     responses:
 *       200:
 *         description: Payment verification result
 */
router.post('/verify-payment', verifyPaymentController.verifyPaymentStatus);

/**
 * @swagger
 * /verify-payment:
 *   get:
 *     summary: Get single payment details
 *     tags: [Verify-Payment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: orderId
 *         schema:
 *           type: string
 *         required: false
 *         description: Order ID
 *       - in: query
 *         name: razorpay_order_id
 *         schema:
 *           type: string
 *         required: false
 *         description: Razorpay Order ID
 *     responses:
 *       200:
 *         description: Payment details fetched successfully
 */
router.get('/verify-payment', verifyPaymentController.getPaymentStatus);

/**
 * @swagger
 * /payments:
 *   get:
 *     summary: Get all payments
 *     tags: [Verify-Payment]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all payments
 */
router.get('/payments', verifyPaymentController.getAllPayments);

module.exports = router;