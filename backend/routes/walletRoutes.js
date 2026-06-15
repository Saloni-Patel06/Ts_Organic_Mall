const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const walletController = require('../controllers/walletController');
const validate = require('../middleware/validationMiddleware');
const auth = require("../middleware/authMiddleware");

/**
 * @swagger
 * tags:
 *   name: Wallets
 *   description: Agent Wallet CRUD & Transactions API
 */


/**
 * @swagger
 * /wallets:
 *   get:
 *     summary: Get all wallets
 *     tags: [Wallets]
 *     security:
 *       - bearerAuth: []

 *     responses:
 *       200:
 *         description: List of wallets
 */
router.get('/wallets', auth, walletController.getAllWallets);
router.get('/wallets/agent/:agentId', auth, walletController.getWalletByAgentId);
router.get('/wallets/:id', auth, walletController.getWalletById);


/**
 * @swagger
 * /wallets:
 *   post:
 *     summary: Create new wallet
 *     tags: [Wallets]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: Rahul Patel
 *               mobile:
 *                 type: string
 *                 example: 9876543210
 *               balance:
 *                 type: number
 *                 example: 1500
 *     responses:
 *       201:
 *         description: Wallet created
 */
router.post(
  '/wallets',
  body('name').notEmpty().withMessage('Agent name is required'),
  validate,
  walletController.createWallet
);


/**
 * @swagger
 * /wallets/{id}:
 *   put:
 *     summary: Update wallet
 *     tags: [Wallets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Wallet updated
 */
router.put('/wallets/:id', auth, walletController.updateWallet);


/**
 * @swagger
 * /wallets/{id}:
 *   delete:
 *     summary: Delete wallet
 *     tags: [Wallets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Wallet deleted
 */
router.delete('/wallets/:id', auth, walletController.deleteWallet);


/**
 * @swagger
 * /wallets/{id}/add-money:
 *   post:
 *     summary: Add money to wallet
 *     tags: [Wallets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 500
 *     responses:
 *       200:
 *         description: Money added
 */
router.post(
  '/wallets/:id/add-money',
  body('amount')
    .notEmpty().withMessage('Amount is required')
    .isNumeric().withMessage('Amount must be number'),
  validate,
  walletController.addMoney
);


/**
 * @swagger
 * /wallets/{id}/deduct-money:
 *   post:
 *     summary: Deduct money from wallet
 *     tags: [Wallets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 300
 *     responses:
 *       200:
 *         description: Money deducted
 */
router.post(
  '/wallets/:id/deduct-money',
  body('amount')
    .notEmpty().withMessage('Amount is required')
    .isNumeric().withMessage('Amount must be number'),
  validate,
  walletController.deductMoney
);

module.exports = router;