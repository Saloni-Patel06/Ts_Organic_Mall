const { getDB } = require("../config/db");
const { ObjectId } = require("mongodb");

const isValidId = (id) => ObjectId.isValid(id);

// GET ALL SUPPORTS
const getSupports = async (req, res, next) => {
    try {
        const db = getDB();
        const supports = await db.collection("support").find({}).toArray();

        const formatted = supports.map((s) => ({
            id: s._id.toString(),
            email: s.email,
            subject: s.subject,
            message: s.message,
            status: s.status || "Open",
            createdAt: s.createdAt,
        }));

        res.status(200).json(formatted);
    } catch (error) {
        next(error);
    }
};

// GET SUPPORT BY ID
const getSupportById = async (req, res, next) => {
    try {
        if (!isValidId(req.params.id)) {
            return res.status(400).json({ message: "Invalid ID" });
        }

        const db = getDB();
        const support = await db.collection("support").findOne({
            _id: new ObjectId(req.params.id),
        });

        if (!support) {
            return res.status(404).json({ message: "Support ticket not found" });
        }

        res.status(200).json({
            id: support._id.toString(),
            email: support.email,
            subject: support.subject,
            message: support.message,
            status: support.status || "Open",
            createdAt: support.createdAt,
        });
    } catch (error) {
        next(error);
    }
};

// CREATE SUPPORT
const createSupport = async (req, res, next) => {
    try {
        const { email, subject, message } = req.body;

        if (!email || !subject || !message) {
            return res.status(400).json({ message: "All fields required" });
        }

        const db = getDB();

        const newSupport = {
            email,
            subject,
            message,
            status: "Open",
            createdAt: new Date(),
        };

        const result = await db.collection("support").insertOne(newSupport);

        res.status(201).json({
            message: "Support ticket created successfully",
            id: result.insertedId.toString(),
        });
    } catch (error) {
        next(error);
    }
};

// UPDATE SUPPORT
const updateSupport = async (req, res, next) => {
    try {
        if (!isValidId(req.params.id)) {
            return res.status(400).json({ message: "Invalid ID" });
        }

        const db = getDB();
        const { status } = req.body;

        const result = await db.collection("support").updateOne(
            { _id: new ObjectId(req.params.id) },
            { $set: { status, updatedAt: new Date() } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: "Support ticket not found" });
        }

        res.status(200).json({ message: "Support ticket updated" });
    } catch (error) {
        next(error);
    }
};

// DELETE SUPPORT
const deleteSupport = async (req, res, next) => {
    try {
        if (!isValidId(req.params.id)) {
            return res.status(400).json({ message: "Invalid ID" });
        }

        const db = getDB();

        const result = await db.collection("support").deleteOne({
            _id: new ObjectId(req.params.id),
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "Support ticket not found" });
        }

        res.status(200).json({ message: "Support ticket deleted" });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getSupports,
    getSupportById,
    createSupport,
    updateSupport,
    deleteSupport,
};