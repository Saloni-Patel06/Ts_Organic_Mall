const { getDB } = require("../config/db");
const { ObjectId } = require("mongodb");

/* ================= GET ALL ================= */
const getWithdraws = async (req, res, next) => {
  try {
    const db = getDB();

    const { agentId } = req.query;

    let filter = {};
    if (agentId) {
      filter.agentId = new ObjectId(agentId);
    }

    const data = await db.collection("withdraws").find(filter).sort({ createdAt: -1 }).toArray();

    res.json({ success: true, data });

  } catch (err) {
    next(err);
  }
};

/* ================= CREATE ================= */
const createWithdraw = async (req, res, next) => {
  try {
    const db = getDB();

    const { agentId, amount, bankDetails, description } = req.body;

    const newWithdraw = {
      agentId: new ObjectId(agentId),
      amount: Number(amount),
      bankDetails,
      description,
      status: "Pending",
      createdAt: new Date()
    };

    await db.collection("withdraws").insertOne(newWithdraw);

    // move amount from balance to pending in wallet
    await db.collection("wallets").updateOne(
      { _id: new ObjectId(agentId) },
      { $inc: { balance: -Number(amount), pending: Number(amount) } }
    );

    res.status(201).json({
      success: true,
      message: "Withdraw request created"
    });

  } catch (err) {
    next(err);
  }
};

/* ================= APPROVE ================= */
const approveWithdraw = async (req, res, next) => {
  try {
    const db = getDB();

    const withdraw = await db.collection("withdraws").findOne({
      _id: new ObjectId(req.params.id)
    });

    if (!withdraw) return res.status(404).json({ success: false, message: "Not found" });
    if (withdraw.status !== "Pending") return res.status(400).json({ success: false, message: "Already processed" });

    await db.collection("withdraws").updateOne(
      { _id: withdraw._id },
      { $set: { status: "Approved" } }
    );

    // deduct balance and pending, increment withdrawn
    await db.collection("wallets").updateOne(
      { _id: withdraw.agentId },
      {
        $inc: {
          // balance: withdraw.amount,
          pending: -withdraw.amount,
          withdrawn: withdraw.amount
        },
        $push: {
          transactions: {
            date: new Date(),
            description: "Withdrawal Approved",
            type: "Debit",
            amount: withdraw.amount
          }
        }
      }
    );

    res.json({ success: true, message: "Approved" });

  } catch (err) {
    next(err);
  }
};

/* ================= REJECT ================= */
const rejectWithdraw = async (req, res, next) => {
  try {
    const db = getDB();

    const withdraw = await db.collection("withdraws").findOne({
      _id: new ObjectId(req.params.id)
    });

    if (!withdraw) return res.status(404).json({ success: false, message: "Not found" });
    if (withdraw.status !== "Pending") return res.status(400).json({ success: false, message: "Already processed" });

    await db.collection("withdraws").updateOne(
      { _id: withdraw._id },
      { $set: { status: "Rejected" } }
    );

    // return pending amount back to balance
    await db.collection("wallets").updateOne(
      { _id: withdraw.agentId },
      { $inc: { pending: -withdraw.amount } }
    );

    res.json({ success: true, message: "Rejected" });

  } catch (err) {
    next(err);
  }
};

const deleteWithdraw = async (req, res, next) => {
  try {
    const db = getDB();
    await db.collection("withdraws").deleteOne({ _id: new ObjectId(req.params.id) });
    res.json({ success: true, message: "Deleted" });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getWithdraws,
  createWithdraw,
  approveWithdraw,
  rejectWithdraw,
  deleteWithdraw
};