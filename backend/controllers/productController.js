const { getDB } = require("../config/db");
const { ObjectId } = require("mongodb");

const isValidId = (id) => ObjectId.isValid(id);

// ✅ GET ALL PRODUCTS (FIXED RESPONSE)
const getProducts = async (req, res, next) => {
    try {
        const db = getDB();

        const products = await db
            .collection("manage-products")
            .find({})
            .toArray();

        const formatted = products.map((p) => ({
            id: p._id.toString(),
            name: p.name,
            category: p.category,
            price: p.price,
            stock: p.stock,
            unit: p.unit || "",
            img: p.img || "",
        }));

        // 🔥 IMPORTANT: Return ARRAY directly
        res.status(200).json(formatted);
    } catch (error) {
        next(error);
    }
};

// ✅ GET PRODUCT BY ID
const getProductById = async (req, res, next) => {
    try {
        if (!isValidId(req.params.id)) {
            return res.status(400).json({ message: "Invalid product ID" });
        }

        const db = getDB();

        const product = await db
            .collection("manage-products")
            .findOne({ _id: new ObjectId(req.params.id) });

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.status(200).json({
            id: product._id.toString(),
            name: product.name,
            category: product.category,
            price: product.price,
            stock: product.stock,
            unit: product.unit || "",
            img: product.img || "",
        });
    } catch (error) {
        next(error);
    }
};

// ✅ CREATE PRODUCT
const createProduct = async (req, res, next) => {
    try {
        const { name, category, price, stock, unit, img } = req.body;

        if (!name || !category || price == null || stock == null) {
            return res.status(400).json({ message: "All required fields required" });
        }

        const db = getDB();

        const newProduct = {
            name,
            category,
            price: Number(price),
            stock: Number(stock),
            unit: unit || "",
            img: img || "",
            createdAt: new Date(),
        };

        const result = await db
            .collection("manage-products")
            .insertOne(newProduct);

        res.status(201).json({
            message: "Product created",
            id: result.insertedId.toString(),
        });
    } catch (error) {
        next(error);
    }
};

// ✅ UPDATE PRODUCT
const updateProduct = async (req, res, next) => {
    try {
        if (!isValidId(req.params.id)) {
            return res.status(400).json({ message: "Invalid product ID" });
        }

        const db = getDB();
        const { name, category, price, stock, unit, img } = req.body;

        const updateFields = {
            ...(name && { name }),
            ...(category && { category }),
            ...(price !== undefined && { price: Number(price) }),
            ...(stock !== undefined && { stock: Number(stock) }),
            ...(unit !== undefined && { unit }),
            ...(img && { img }),
            updatedAt: new Date(),
        };

        const result = await db.collection("manage-products").updateOne(
            { _id: new ObjectId(req.params.id) },
            { $set: updateFields }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.status(200).json({ message: "Product updated" });
    } catch (error) {
        next(error);
    }
};

// ✅ DELETE PRODUCT
const deleteProduct = async (req, res, next) => {
    try {
        if (!isValidId(req.params.id)) {
            return res.status(400).json({ message: "Invalid product ID" });
        }

        const db = getDB();

        const result = await db
            .collection("manage-products")
            .deleteOne({ _id: new ObjectId(req.params.id) });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.status(200).json({ message: "Product deleted" });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
};