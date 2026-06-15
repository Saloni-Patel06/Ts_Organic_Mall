const { getDB } = require("../config/db");
const { ObjectId } = require("mongodb");

/* ================= GET CART ================= */
const getCart = async (req, res, next) => {
    try {
        const { customerId } = req.params;
        const db = getDB();

        const cart = await db.collection("carts").findOne({ customerId });

        if (!cart) {
            return res.status(200).json({
                customerId,
                items: [],
                totalAmount: 0,
            });
        }

        res.status(200).json(cart);
    } catch (error) {
        next(error);
    }
};

/* ================= ADD TO CART ================= */
const addToCart = async (req, res, next) => {
    try {
        const { customerId, productId, productName, productImage, price, quantity, unit } = req.body;
        const db = getDB();
        let cart = await db.collection("carts").findOne({ customerId });

        if (cart) {
            const itemIndex = cart.items.findIndex(
                (item) => item.productId === productId && item.unit === unit
            );
            if (itemIndex > -1) {
                cart.items[itemIndex].quantity += quantity;
            } else {
                cart.items.push({ productId, productName, productImage, price, quantity, unit });
            }
            const totalAmount = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
            await db.collection("carts").updateOne(
                { customerId },
                { $set: { items: cart.items, totalAmount, updatedAt: new Date() } }
            );
        } else {
            await db.collection("carts").insertOne({
                customerId,
                items: [{ productId, productName, productImage, price, quantity, unit }],
                totalAmount: price * quantity,
                createdAt: new Date(),
            });
        }
        res.status(200).json({ message: "Item added to cart" });
    } catch (error) {
        next(error);
    }
};

/* ================= UPDATE CART ITEM ================= */
const updateCartItem = async (req, res, next) => {
    try {
        const { customerId, productId, quantity, unit } = req.body;
        const db = getDB();
        const cart = await db.collection("carts").findOne({ customerId });
        if (!cart) return res.status(404).json({ message: "Cart not found" });

        const itemIndex = cart.items.findIndex(
            (item) => item.productId === productId && item.unit === unit
        );
        if (itemIndex === -1) return res.status(404).json({ message: "Item not found in cart" });

        if (quantity <= 0) {
            cart.items.splice(itemIndex, 1);
        } else {
            cart.items[itemIndex].quantity = quantity;
        }
        const totalAmount = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        await db.collection("carts").updateOne(
            { customerId },
            { $set: { items: cart.items, totalAmount, updatedAt: new Date() } }
        );
        res.status(200).json({ message: "Cart updated" });
    } catch (error) {
        next(error);
    }
};

const removeFromCart = async (req, res, next) => {
    try {
        const { customerId, productId, unit } = req.body;
        const db = getDB();
        const cart = await db.collection("carts").findOne({ customerId });
        if (!cart) return res.status(404).json({ message: "Cart not found" });

        const updatedItems = cart.items.filter(
            (item) => !(item.productId === productId && item.unit === unit)
        );
        const totalAmount = updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
        await db.collection("carts").updateOne(
            { customerId },
            { $set: { items: updatedItems, totalAmount, updatedAt: new Date() } }
        );
        res.status(200).json({ message: "Item removed" });
    } catch (error) {
        next(error);
    }
};

/* ================= CLEAR CART ================= */
const clearCart = async (req, res, next) => {
    try {
        const { customerId } = req.params;
        const db = getDB();

        await db.collection("carts").deleteOne({ customerId });

        res.status(200).json({ message: "Cart cleared" });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
};