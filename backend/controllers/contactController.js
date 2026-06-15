const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');

const getContacts = async (req, res, next) => {
  try {
    const db = getDB();
    const contacts = await db.collection("contacts")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    const formatted = contacts.map(contact => ({
      id: contact._id.toString(),
      userId: contact.userId || "",
      name: contact.name,
      email: contact.email,
      message: contact.message,
      status: contact.status || "Pending",
      createdAt: contact.createdAt
    }));

    res.json(formatted);
  } catch (error) {
    next(error);
  }
};

const getContactById = async (req, res, next) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid Contact ID" });
    }

    const db = getDB();
    const contact = await db.collection("contacts").findOne({ _id: new ObjectId(req.params.id) });

    if (!contact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    res.json({
      id: contact._id.toString(),
      userId: contact.userId || "",
      name: contact.name,
      email: contact.email,
      message: contact.message,
      status: contact.status,
      createdAt: contact.createdAt
    });
  } catch (error) {
    next(error);
  }
};

const createContact = async (req, res, next) => {
  try {
    const db = getDB();
    const newContact = {
      userId: req.body.userId || null,
      name: req.body.name,
      email: req.body.email,
      message: req.body.message,
      status: "Pending",
      createdAt: new Date()
    };

    const result = await db.collection("contacts").insertOne(newContact);
    res.status(201).json({ message: "Contact created successfully", id: result.insertedId.toString() });
  } catch (error) {
    next(error);
  }
};

const updateContact = async (req, res, next) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid Contact ID" });
    }

    const db = getDB();
    const updateFields = {
      name: req.body.name,
      email: req.body.email,
      message: req.body.message,
      status: req.body.status,
      userId: req.body.userId,
      updatedAt: new Date()
    };

    const result = await db.collection("contacts").updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Contact not found" });
    }

    res.json({ message: "Contact updated successfully" });
  } catch (error) {
    next(error);
  }
};

const deleteContact = async (req, res, next) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid Contact ID" });
    }

    const db = getDB();
    const result = await db.collection("contacts").deleteOne({ _id: new ObjectId(req.params.id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Contact not found" });
    }

    res.json({ message: "Contact deleted successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact
};
