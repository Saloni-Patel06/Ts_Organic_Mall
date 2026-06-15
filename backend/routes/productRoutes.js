const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const auth = require("../middleware/authMiddleware");

/**
 * @swagger
 * tags:
 *   name: ManageProducts
 *   description: Manage Products CRUD API
 */

/**
 * @swagger
 * /manage-products:
 *   get:
 *     summary: Get all products
 *     tags: [ManageProducts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of products
 */
router.get("/", productController.getProducts);

/**
 * @swagger
 * /manage-products/{id}:
 *   get:
 *     summary: Get product by ID
 *     tags: [ManageProducts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 69a55566de238191cf952181
 *     responses:
 *       200:
 *         description: Product found
 */
router.get("/:id", productController.getProductById);

/**
 * @swagger
 * /manage-products:
 *   post:
 *     summary: Create product
 *     tags: [ManageProducts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               
 *               - name
 *               - category
 *               - price
 *               - stock
 *             properties:
 *               name:
 *                 type: string
 *                 example: Apple
 *               category:
 *                 type: string
 *                 example: Fruits
 *               price:
 *                 type: integer
 *                 example: 50
 *               stock:
 *                 type: integer
 *                 example: 20
 *               img:
 *                 type: string
 *                 example: /img/default.png
 *     responses:
 *       201:
 *         description: Product created
 */
router.post("/", productController.createProduct);

/**
 * @swagger
 * /manage-products/{id}:
 *   put:
 *     summary: Update product
 *     tags: [ManageProducts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 69a55566de238191cf952181
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               category:
 *                 type: string
 *               price:
 *                 type: integer
 *               stock:
 *                 type: integer
 *               img:
 *                 type: string
 *     responses:
 *       200:
 *         description: Product updated
 */
router.put("/:id", auth, productController.updateProduct);

/**
 * @swagger
 * /manage-products/{id}:
 *   delete:
 *     summary: Delete product
 *     tags: [ManageProducts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 69a55566de238191cf952181
 *     responses:
 *       200:
 *         description: Product deleted
 */
router.delete("/:id", auth, productController.deleteProduct);

module.exports = router;