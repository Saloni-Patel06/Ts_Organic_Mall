const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const authController = require('../controllers/authController');
const validate = require('../middleware/validationMiddleware');
// const auth = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: Customer Register CRUD API
 */

/**
 * @swagger
 * /registers:
 *   post:
 *     summary: Create new Customer register
 *     tags: [Authentication]
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
 *               name:
 *                 type: string
 *                 example: Dipali            
 *               email:
 *                 type: string
 *                 example: dipali@gmail.com
 *               password:
 *                 type: string
 *                 example: 123456
 *               mobile:
 *                 type: string
 *                 example: 9876543210
 *               gender:
 *                 type: string
 *                 example: female
 *               emailOtp:
 *                 type: string
 *                 example: 1234
 *               address:
 *                 type: string
 *                 example: Anand
 *               pincode:
 *                 type: string
 *                 example: 388001
 *     responses:
 *       201:
 *         description: Register created
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized access
 *       404:
 *         description: Register not found
 *       500:
 *         description: Internal server error
 */

router.post(
  '/register',
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
    .optional()
    .isLength({ min: 10 }).withMessage('Mobile must be at least 10 digits'),

  validate,
  authController.createRegister
);

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Login user using email and password
 *     tags: [Authentication]
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
 *                 example: Dipali004@gmail.com
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
  "/login",

  body('email')
    .notEmpty().withMessage('email is required'),

  body('password')
    .notEmpty().withMessage('Password is required'),

  validate,
  authController.loginUser
);
router.post("/verify-otp",authController.verifyOTP);

/**
 * @swagger
 * /refresh-token:
 *   post:
 *     summary: Generate new access token using refresh token
 *     tags: [Authentication]
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
  "/refresh-token",

  body('refreshToken')
    .notEmpty().withMessage('Refresh token is required'),

  validate,
  authController.refreshToken
);


module.exports = router;