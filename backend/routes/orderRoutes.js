const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const orderController = require('../controllers/orderController');
const validate = require('../middleware/validationMiddleware');
const auth = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order Management API
 */


/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Get all orders
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of orders
 */
router.get('/orders', auth, orderController.getOrders);


/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: Get order by ID
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order found
 *       404:
 *         description: Order not found
 */
router.get('/orders/:id', auth, orderController.getOrderById);


/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Create new order
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customer
 *               - products
 *             properties:
 *               customer:
 *                 type: string
 *                 example: Rahul Patel
 *               agentName:
 *                 type: string
 *                 example: Amit
 *               mobile:
 *                 type: string
 *                 example: "9876543210"
 *               payment:
 *                 type: string
 *                 example: Completed
 *               delivery:
 *                 type: string
 *                 example: Delivered
 *               scheduleDate:
 *                 type: string
 *                 example: 20 March 2026
 *               timeSlot:
 *                 type: string
 *                 example: 10AM - 1PM
 *               products:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     qty:
 *                       type: number
 *                     price:
 *                       type: number
 *     responses:
 *       201:
 *         description: Order created
 */
router.post(
    '/orders',
    auth, // ✅ REQUIRED (for customerId)
    body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
    validate,
    async (req, res, next) => {
        try {
            // ✅ AUTO ADD CUSTOMER ID FROM TOKEN
            req.body.customerId = req.user._id;

            return orderController.createOrder(req, res, next);
        } catch (err) {
            next(err);
        }
    }
);

/**
 * @swagger
 * /orders/{id}:
 *   put:
 *     summary: Update order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order updated
 */
// router.patch('/orders/:id',auth, orderController.updateOrder);
router.put('/orders/:id', auth, orderController.updateOrder);



/**
 * @swagger
 * /orders/{id}:
 *   delete:
 *     summary: Delete order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order deleted
 */
router.delete('/orders/:id', auth, orderController.deleteOrder);

router.put('/orders/:id/schedule', orderController.updateOrderSchedule);
router.put('/orders/:id/assign-agent', orderController.assignAgent);
router.put('/orders/:id/deliver', orderController.markDelivered);
router.get('/orders/pending-for-agent', orderController.getPendingOrdersForAgent);
router.put('/orders/:id/agent-accept', orderController.agentAcceptOrder);
router.put('/orders/:id/out-for-delivery', orderController.markOutForDelivery);

// ✅ Cancel order route
router.put('/orders/:id/cancel', auth, orderController.cancelOrder);

// ✅ Delivery OTP Routes (Agent protected)
router.put('/orders/:id/generate-delivery-otp', auth, orderController.generateDeliveryOtp);

router.put('/orders/:id/verify-delivery-otp',
  auth,
  [
    body('otp')
      .notEmpty().withMessage('OTP is required')
      .isLength({ min: 4, max: 4 }).withMessage('OTP must be 4 digits')
  ],
  validate,
  orderController.verifyDeliveryOtp
);

/**
 * @swagger
 * /orders/{id}/generate-delivery-otp:
 *   put:
 *     summary: Generate delivery OTP (send to customer)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: OTP sent to customer
 */

/**
 * @swagger
 * /orders/{id}/verify-delivery-otp:
 *   put:
 *     summary: Agent verifies customer delivery OTP
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             properties:
 *               otp:
 *                 type: string
 *                 example: 1234
 *     responses:
 *       200:
 *         description: Order delivered + agent credited
 */

// Create Razorpay Order - No auth needed for checkout
router.post('/create-order', orderController.createRazorpayOrder);

module.exports = router;
