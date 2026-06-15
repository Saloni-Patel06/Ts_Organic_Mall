const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const agentregController = require('../controllers/agentregController');
const validate = require('../middleware/validationMiddleware');
// const auth = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Agent Authentication
 *   description: Agent Register & Login API
 */


/**
 * @swagger
 * /agent/register:
 *   post:
 *     summary: Create new agent
 *     tags: [Agent Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - mobile
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 example: agent@gmail.com
 *               password:
 *                 type: string
 *                 example: 123456
 *               mobile:
 *                 type: string
 *                 example: 9876543210
 *               gender:
 *                 type: string
 *                 example: male
 *               address:
 *                 type: string
 *                 example: Surat
 *               pincode:
 *                 type: string
 *                 example: 395006
 *               vehicleNumber:
 *                 type: string
 *                 example: GJ05AB1234
 *     responses:
 *       201:
 *         description: Agent created
 *       400:
 *         description: Invalid request
 *       500:
 *         description: Internal server error
 */
router.post(
  '/agent/register',
  body('name')
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 3 }).withMessage('Name must be at least 3 characters'),

  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Valid email is required'),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),

  body('mobile')
    .notEmpty().withMessage('Mobile is required')
    .isLength({ min: 10 }).withMessage('Mobile must be at least 10 digits'),

  body('vehicleNumber')
    .optional(),

  body('pincode')
    .optional(),

  validate,
  agentregController.agentRegister
);


/**
 * @swagger
 * /agent/login:
 *   post:
 *     summary: Login agent using email and password
 *     tags: [Agent Authentication]
 
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: agent@gmail.com
 *               password:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Invalid credentials
 *       500:
 *         description: Internal server error
 */

router.post(
  "/agent/login",

  body('email')
    .notEmpty().withMessage('Email is required'),

  body('password')
    .notEmpty().withMessage('Password is required'),

  validate,
  agentregController.loginAgent
);


/**
 * @swagger
 * /agent/refresh-token:
 *   post:
 *     summary: Generate new access token using refresh token
 *     tags: [Agent Authentication]

 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: your_refresh_token_here
 *     responses:
 *       200:
 *         description: New access token generated
 *       401:
 *         description: Invalid refresh token
 *       500:
 *         description: Internal server error
 */

router.post(
  "/agent/verify-otp",
  [
    body('email')
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Valid email is required'),
    body('otp')
      .notEmpty().withMessage('OTP is required')
      .isLength({ min: 4, max: 4 }).withMessage('OTP must be 4 digits')
  ],
  validate,
  agentregController.agentVerifyOTP
);

/**
 * @swagger
 * /agent/verify-otp:
 *   post:
 *     summary: Verify agent OTP and activate account
 *     tags: [Agent Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *                 example: agent@gmail.com
 *               otp:
 *                 type: string
 *                 example: 1234
 *     responses:
 *       200:
 *         description: Agent activated
 *       400:
 *         description: Invalid OTP
 */

router.post(
  "/agent/refresh-token",

  body('refreshToken')
    .notEmpty().withMessage('Refresh token is required'),

  validate,
  agentregController.refreshAgentToken
);

module.exports = router;
