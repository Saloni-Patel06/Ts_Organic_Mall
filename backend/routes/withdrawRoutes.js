const express = require("express");
const { body } = require("express-validator");
const router = express.Router();

const withdrawController = require("../controllers/withdrawController");
const validate = require("../middleware/validationMiddleware");
const auth = require("../middleware/authMiddleware");

/**
 * @swagger
 * tags:
 *   name: Withdraw
 *   description: Withdraw Request API
 */


/**
 * @swagger
 * /withdraw:
 *   get:
 *     summary: Get all withdraw requests (optional filter by agentId)
 *     tags: [Withdraw]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: agentId
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of withdraw requests
 */
router.get("/withdraw", auth, withdrawController.getWithdraws);


/**
 * @swagger
 * /withdraw:
 *   post:
 *     summary: Create withdraw request
 *     tags: [Withdraw]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - agentId
 *               - amount
 *             properties:
 *               agentId:
 *                 type: string
 *                 example: 64f123abc123
 *               amount:
 *                 type: number
 *                 example: 500
 *               bankDetails:
 *                 type: string
 *                 example: 1234567890 / UPI
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Withdraw request created
 */
router.post(
  "/withdraw",
  
  body("agentId").notEmpty().withMessage("AgentId required"),
  body("amount").notEmpty().isNumeric().withMessage("Valid amount required"),
  validate,
  withdrawController.createWithdraw
);


/**
 * @swagger
 * /withdraw/{id}/approve:
 *   put:
 *     summary: Approve withdraw request
 *     tags: [Withdraw]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Approved
 */
router.put("/withdraw/:id/approve", auth, withdrawController.approveWithdraw);


/**
 * @swagger
 * /withdraw/{id}/reject:
 *   put:
 *     summary: Reject withdraw request
 *     tags: [Withdraw]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Rejected
 */
router.put("/withdraw/:id/reject", auth, withdrawController.rejectWithdraw);

router.delete("/withdraw/:id", auth, withdrawController.deleteWithdraw);


module.exports = router;