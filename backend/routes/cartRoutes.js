const express = require("express");
const { body } = require("express-validator");
const router = express.Router();

const cartController = require("../controllers/cartController");
const validate = require("../middleware/validationMiddleware");
const auth = require("../middleware/authMiddleware");

/* ================= GET CART ================= */
router.get("/cart", auth, async (req, res, next) => {
    try {
        req.params.customerId = req.user._id; // ✅ AUTO USER
        return cartController.getCart(req, res, next);
    } catch (err) {
        next(err);
    }
});

/* ================= ADD TO CART ================= */
router.post(
    "/cart/add",
    auth,
    body("productId").notEmpty().withMessage("Product ID required"),
    body("productName").notEmpty().withMessage("Product name required"),
    body("price").isNumeric().withMessage("Price must be numeric"),
    body("quantity").isInt({ min: 1 }).withMessage("Quantity must be at least 1"),
    validate,
    async (req, res, next) => {
        try {
            req.body.customerId = req.user._id; // ✅ AUTO USER
            return cartController.addToCart(req, res, next);
        } catch (err) {
            next(err);
        }
    }
);

/* ================= UPDATE CART ================= */
router.put(
    "/cart/update",
    auth,
    body("productId").notEmpty().withMessage("Product ID required"),
    body("quantity").isInt({ min: 0 }).withMessage("Quantity must be >= 0"),
    validate,
    async (req, res, next) => {
        try {
            req.body.customerId = req.user._id; // ✅ AUTO USER
            return cartController.updateCartItem(req, res, next);
        } catch (err) {
            next(err);
        }
    }
);

/* ================= REMOVE ITEM ================= */
router.delete(
    "/cart/remove",
    auth,
    body("productId").notEmpty().withMessage("Product ID required"),
    validate,
    async (req, res, next) => {
        try {
            req.body.customerId = req.user._id; // ✅ AUTO USER
            return cartController.removeFromCart(req, res, next);
        } catch (err) {
            next(err);
        }
    }
);

/* ================= CLEAR CART ================= */
router.delete("/cart/clear", auth, async (req, res, next) => {
    try {
        req.params.customerId = req.user._id; // ✅ AUTO USER
        return cartController.clearCart(req, res, next);
    } catch (err) {
        next(err);
    }
});

module.exports = router;