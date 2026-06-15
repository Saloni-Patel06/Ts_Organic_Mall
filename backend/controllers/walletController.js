const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');


/* ======================================================
   GET ALL WALLETS
====================================================== */
const getAllWallets = async (req, res, next) => {
  try {
    const db = getDB();
    const wallets = await db.collection("wallets").find().toArray();

    res.json({ success: true, data: wallets });

  } catch (error) {
    next(error);
  }
};


/* ======================================================
   GET WALLET BY ID
====================================================== */
const getWalletById = async (req, res, next) => {
  try {
    const db = getDB();

    const wallet = await db.collection("wallets").findOne({
      _id: new ObjectId(req.params.id)
    });

    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: "Wallet not found"
      });
      // if (wallet.transactions && wallet.transactions.length > 0) {
      //   wallet.transactions = wallet.transactions.sort(
      //     (a, b) => new Date(b.date) - new Date(a.date)
      //   );
      // }
    }

    res.json({ success: true, data: wallet });

  } catch (error) {
    next(error);
  }
};


/* ======================================================
   CREATE WALLET
====================================================== */
const getWalletByAgentId = async (req, res, next) => {
  try {
    const db = getDB();
    const agentIdStr = req.params.agentId;
    let agentObjId;
    
    try {
      agentObjId = new ObjectId(agentIdStr);
    } catch {
      return res.status(400).json({ success: false, message: "Invalid agent ID format" });
    }

    // Direct lookup by agentId ObjectId ONLY - no fallbacks to prevent duplicates
    let wallet = await db.collection("wallets").findOne({ agentId: agentObjId });

    if (!wallet) {
      // Check if agent exists and auto-create wallet
      const agent = await db.collection("users").findOne({ 
        _id: agentObjId, 
        role: "agent" 
      });

      if (!agent) {
        return res.status(404).json({ success: false, message: "Agent not found" });
      }

      // Create new wallet
      const newWallet = {
        agentId: agentObjId,
        name: agent.name,
        mobile: agent.mobile || "",
        totalEarnings: 0,
        balance: 0,
        withdrawn: 0,
        pending: 0,
        transactions: []
      };
      const result = await db.collection("wallets").insertOne(newWallet);
      wallet = { _id: result.insertedId, ...newWallet };
    }

    res.json({ success: true, data: wallet });
  } catch (error) {
    console.error("getWalletByAgentId error:", error);
    next(error);
  }
};


const createWallet = async (req, res, next) => {
  try {
    const db = getDB();

    const newWallet = {
      agentId: req.body.agentId ? new ObjectId(req.body.agentId) : null,
      name: req.body.name,
      mobile: req.body.mobile || "",
      totalEarnings: req.body.totalEarnings || 0,
      balance: req.body.balance || 0,
      withdrawn: 0,
      pending: 0,
      transactions: []
    };

    const result = await db.collection("wallets").insertOne(newWallet);

    res.status(201).json({
      success: true,
      message: "Wallet created",
      insertedId: result.insertedId
    });

  } catch (error) {
    next(error);
  }
};


/* ======================================================
   UPDATE WALLET
====================================================== */
const updateWallet = async (req, res, next) => {
  try {
    const db = getDB();

    const result = await db.collection("wallets").updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: req.body }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Wallet not found"
      });
    }

    res.json({ success: true, message: "Wallet updated" });

  } catch (error) {
    next(error);
  }
};


/* ======================================================
   DELETE WALLET
====================================================== */
const deleteWallet = async (req, res, next) => {
  try {
    const db = getDB();

    const result = await db.collection("wallets").deleteOne({
      _id: new ObjectId(req.params.id)
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Wallet not found"
      });
    }

    res.json({ success: true, message: "Wallet deleted" });

  } catch (error) {
    next(error);
  }
};


/* ======================================================
   ADD MONEY
====================================================== */
const addMoney = async (req, res, next) => {
  try {
    const db = getDB();
    const { amount } = req.body;

    const wallet = await db.collection("wallets").findOne({
      _id: new ObjectId(req.params.id)
    });

    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: "Wallet not found"
      });
    }

    await db.collection("wallets").updateOne(
      { _id: new ObjectId(req.params.id) },
      {
        $inc: {
          balance: amount,
          totalEarnings: amount
        },
        $push: {
          transactions: {
            date: new Date(),
            description: "Money Added",
            type: "Credit",
            amount
          }
        }
      }
    );

    res.json({ success: true, message: "Money added successfully" });

  } catch (error) {
    next(error);
  }
};


/* ======================================================
   DEDUCT MONEY
====================================================== */
const deductMoney = async (req, res, next) => {
  try {
    const db = getDB();
    const { amount } = req.body;

    const wallet = await db.collection("wallets").findOne({
      _id: new ObjectId(req.params.id)
    });

    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: "Wallet not found"
      });
    }

    if (wallet.balance < amount) {
      return res.status(400).json({
        success: false,
        message: "Insufficient balance"
      });
    }

    await db.collection("wallets").updateOne(
      { _id: new ObjectId(req.params.id) },
      {
        $inc: {
          balance: -amount,
          withdrawn: amount
        },
        $push: {
          transactions: {
            date: new Date(),
            description: "Withdrawal",
            type: "Debit",
            amount
          }
        }
      }
    );

    res.json({ success: true, message: "Money deducted successfully" });

  } catch (error) {
    next(error);
  }
};




module.exports = {
  getAllWallets,
  getWalletById,
  getWalletByAgentId,
  createWallet,
  updateWallet,
  deleteWallet,
  addMoney,
  deductMoney
};
