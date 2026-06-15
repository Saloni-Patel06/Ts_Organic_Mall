const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const supportController = require('../controllers/supportController');
const validate = require('../middleware/validationMiddleware');
const auth = require('../middleware/authMiddleware');

/**
 * @swagger
 * /supports:
 *   get:
 *     summary: Get all support tickets
 *     tags: [Support]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of support tickets
 */
router.get('/supports', auth, supportController.getSupports);

/**
 * @swagger
 * /supports/{id}:
 *   get:
 *     summary: Get support ticket by ID
 *     tags: [Support]
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
 *         description: Support ticket details
 */
router.get('/supports/:id',auth, supportController.getSupportById);

/**
 * @swagger
 * /supports:
 *   post:
 *     summary: Create support ticket
 *     tags: [Support]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               subject:
 *                 type: string
 *               message:
 *                 type: string
 *     responses:
 *       201:
 *         description: Support ticket created
 */
router.post(
    '/supports',
    body('email').isEmail().withMessage('Valid email required'),
    body('subject').notEmpty().withMessage('Subject is required'),
    body('message').notEmpty().withMessage('Message is required'),
    validate,
    supportController.createSupport
);

/**
 * @swagger
 * /supports/{id}:
 *   put:
 *     summary: Update support ticket status
 *     tags: [Support]
 *     security:
 *       - bearerAuth: []
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
 *             properties:
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Support ticket updated
 */
router.put('/supports/:id',auth, supportController.updateSupport);

/**
 * @swagger
 * /supports/{id}:
 *   delete:
 *     summary: Delete support ticket
 *     tags: [Support]
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
 *         description: Support ticket deleted
 */
router.delete('/supports/:id',auth, supportController.deleteSupport);

module.exports = router;