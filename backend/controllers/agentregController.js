const bcrypt = require("bcryptjs");
const { getDB } = require("../config/db");
const { generateAccessToken, generateRefreshToken } = require("../utils/jwt");
const jwt = require("jsonwebtoken");
const { ObjectId } = require("mongodb");
const generateOTP = require("../utils/otp");
const sendEmail = require("../utils/sendEmail");


// ================= LOGIN AGENT =================
const loginAgent = async (req, res, next) => {
  try {
    const db = getDB();
    const { email, password } = req.body;

    const agent = await db.collection("users").findOne({
      email,
      role: "agent"
    });

    if (!agent) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    const isMatch = await bcrypt.compare(password, agent.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    const accessToken = generateAccessToken(agent);
    const refreshToken = generateRefreshToken(agent);

    await db.collection("users").updateOne(
      { _id: agent._id },
      { $set: { refreshToken, lastActive: new Date() } }
    );

    res.json({
      success: true,
      accessToken,
      refreshToken,
      user: {   // ✅ SAME AS USER
        _id: agent._id.toString(),
        id: agent._id.toString(),
        name: agent.name,
        email: agent.email,
        role: agent.role
      }
    });

  } catch (error) {
    next(error);
  }
};


// ================= REGISTER AGENT (SEND OTP) =================
const agentRegister = async (req, res, next) => {
  try {
    const db = getDB();

    const {
      name,
      email,
      password,
      mobile,
      gender,
      address,
      pincode,
      vehicleNumber
    } = req.body;

    // Check existing active agent
    const existingAgent = await db.collection("users").findOne({ 
      email, 
      status: "Active" 
    });

    if (existingAgent) {
      return res.status(400).json({
        success: false,
        message: "Email already registered and active"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate OTP + expiry
    const otp = generateOTP();
    const otpExpires = Date.now() + 5 * 60 * 1000; // 5 minutes

    const newAgent = {
      name,
      email,
      password: hashedPassword,
      role: "agent",
      mobile: mobile || "",
      gender: gender || "",
      address: address || "",
      pincode: pincode || "",
      vehicleNumber: vehicleNumber || "",
      status: "Inactive",
      otp,
      otpExpires,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Insert or update inactive agent
    await db.collection("users").updateOne(
      { email },
      { $set: newAgent },
      { upsert: true }
    );

    // Send OTP email
    await sendEmail(
      email,
      "Verify Your Email 🔐 | TS Organic Mall",
      `
      <div style="font-family: Arial, sans-serif; background:#f6f9fc; padding:20px;">
        <div style="max-width:600px; margin:auto; background:#ffffff; border-radius:10px; overflow:hidden; box-shadow:0 5px 15px rgba(0,0,0,0.1);">
          <div style="background:#16a34a; color:#fff; padding:20px; text-align:center;">
            <h2 style="margin:0;">TS Organic Mall</h2>
          </div>
          <div style="padding:30px; text-align:center;">
            <h3>Agent Email Verification</h3>
            <p>Enter this OTP: <strong style="font-size:28px; letter-spacing:8px;">${otp}</strong></p>
            <p>Valid for 5 minutes.</p>
          </div>
          <div style="background:#f9fafb; padding:15px; text-align:center; font-size:12px; color:#999;">
            © ${new Date().getFullYear()} TS Organic Mall
          </div>
        </div>
      </div>
      `
    );

    // Return user ID for frontend
    const user = await db.collection("users").findOne({ email });
    res.status(201).json({
      success: true,
      message: "Agent registered. OTP sent to email.",
      userId: user._id.toString(),
      email
    });

  } catch (error) {
    next(error);
  }
};



// ================= REFRESH TOKEN =================
const refreshAgentToken = async (req, res) => {
  try {
    const db = getDB();
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token required"
      });
    }

    const decoded = jwt.verify(refreshToken, "qweuansdasdg123123");

    const agent = await db.collection("users").findOne({
      _id: new ObjectId(decoded.id),
      refreshToken,
      role: "agent"
    });

    if (!agent) {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token"
      });
    }

    const accessToken = generateAccessToken(agent);

    res.json({
      success: true,
      accessToken
    });

  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Invalid refresh token"
    });
  }
};


// ================= VERIFY AGENT OTP =================
const agentVerifyOTP = async (req, res) => {
  try {
    const db = getDB();
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: "Email and OTP required" });
    }

    const agent = await db.collection("users").findOne({ 
      email, 
      role: "agent" 
    });
    
    if (!agent) {
      return res.status(404).json({ success: false, message: "Agent not found" });
    }

    // Check OTP match
    if (agent.otp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    // Check expiry
    if (agent.otpExpires && Date.now() > agent.otpExpires) {
      await db.collection("users").updateOne(
        { email },
        { $set: { status: "OTP Expired" } }
      );
      return res.status(400).json({ success: false, message: "OTP expired" });
    }

    // Activate agent, clear OTP
    await db.collection("users").updateOne(
      { email },
      {
        $set: {
          status: "Active",
          balance: 0,
          updatedAt: new Date()
        },
        $unset: {
          otp: "",
          otpExpires: ""
        }
      }
    );

    // Create wallet AFTER verification
    await db.collection("wallets").insertOne({
      agentId: agent._id,
      name: agent.name,
      mobile: agent.mobile || "",
      totalEarnings: 0,
      balance: 0,
      withdrawn: 0,
      pending: 0,
      transactions: []
    });

    res.json({ 
      success: true, 
      message: "Agent email verified successfully. You can now login." 
    });
  } catch (err) {
    console.error("Verify Agent OTP error:", err);
    res.status(500).json({ success: false, message: "Server error verifying OTP" });
  }
};

module.exports = {
  agentRegister,
  agentVerifyOTP,
  loginAgent,
  refreshAgentToken
};

