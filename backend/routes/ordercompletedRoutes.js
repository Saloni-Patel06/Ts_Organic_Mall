const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const ordercompletedController = require('../controllers/ordercompletedController');
const validate = require('../middleware/validationMiddleware');
const auth = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order Completed API
 */

/**
 * @swagger
 * /order-complete:
 *   post:
 *     summary: Create completed order
 *     tags: [OrderCompleted]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customerId
 *               - items
 *               - subtotal
 *               - tax
 *               - total
 *             properties:
 *               customerId:
 *                 type: string
 *                 example: 665d1c6a2b9b2f0012a8c321
 *               items:
 *                 type: array
 *                 example:
 *                   - productId: "1"
 *                     name: Banana
 *                     price: 35
 *                     qty: 2
 *               subtotal:
 *                 type: number
 *                 example: 70
 *               tax:
 *                 type: number
 *                 example: 3.5
 *               total:
 *                 type: number
 *                 example: 73.5
 *               addressId:
 *                 type: string
 *                 example: 665d1c6a2b9b2f0012a8c999
 *               paymentMethod:
 *                 type: string
 *                 example: UPI
 *     responses:
 *       201:
 *         description: Order placed successfully
 *       400:
 *         description: Invalid request
 *       500:
 *         description: Internal server error
 */

router.post(
    "/order-complete",

    body('customerId')
        .notEmpty().withMessage('Customer ID is required'),

    body('items')
        .isArray({ min: 1 }).withMessage('Items are required'),

    body('subtotal')
        .notEmpty().withMessage('Subtotal is required'),

    body('tax')
        .notEmpty().withMessage('Tax is required'),

    body('total')
        .notEmpty().withMessage('Total is required'),

    validate,
    ordercompletedController.createOrderCompleted
);

module.exports = router;