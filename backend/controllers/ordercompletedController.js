const { getDB } = require("../config/db");
const { ObjectId } = require("mongodb");

const createOrderCompleted = async (req, res, next) => {
    try {

        const db = getDB();

        const {
            customerId,
            items,
            subtotal,
            tax,
            total,
            addressId,
            paymentMethod
        } = req.body;

        if (!customerId || !items || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid order data"
            });
        }

        const newOrder = {
            customerId: new ObjectId(customerId),
            items,
            subtotal,
            tax,
            total,
            addressId: addressId ? new ObjectId(addressId) : null,
            paymentMethod: paymentMethod || "COD",
            status: "Completed",
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const result = await db.collection("orders").insertOne(newOrder);

        // 🛒 Clear cart after order
        await db.collection("cart").deleteMany({
            customerId: new ObjectId(customerId)
        });

        res.status(201).json({
            success: true,
            message: "Order placed successfully",
            orderId: result.insertedId
        });

    } catch (error) {
        next(error);
    }
};

module.exports = {
    createOrderCompleted
};