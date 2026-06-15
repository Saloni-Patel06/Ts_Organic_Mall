const bcrypt = require("bcryptjs");
const { getDB } = require("../config/db");
const { generateAccessToken, generateRefreshToken } = require("../utils/jwt");
const jwt = require("jsonwebtoken");
const { ObjectId } = require("mongodb");
const generateOTP = require("../utils/otp");
const sendEmail = require("../utils/sendEmail");

const findUserByEmail = async (db, email) => {
  return await db.collection("users").findOne({ email });
};

// ================= LOGIN =================
const loginUser = async (req, res, next) => {
    try {
        const db = getDB();
        const { email, password } = req.body;

        const user = await db.collection("users").findOne({ email });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        await db.collection("users").updateOne(
            { _id: user._id },
            { $set: { refreshToken, lastActive: new Date() } }
        );

        res.json({
            success: true,
            accessToken,
            refreshToken,
            user: {
                _id: user._id.toString(),
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        next(error);
    }
};

// ================= REGISTER =================
const createRegister = async (req, res, next) => {
    try {
        const db = getDB();

        const {
            role,
            name,
            email,
            password,
            mobile,
            city,
            address,
            pincode,
            vehicleNumber
        } = req.body;

        // 🔎 Check existing active user
        const existingUser = await db.collection("users").findOne({ email, status: "Active" });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Email already registered and active"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate OTP (string) + expiry
        const otp = generateOTP();
        const otpExpires = Date.now() + 5 * 60 * 1000; // 5 minutes

        const newUser = {
            role: role || "customer",
            name,
            email,
            password: hashedPassword,
            mobile,
            pincode,
            ...(role === "customer" && { city, address }),
            ...(role === "agent" && { vehicleNumber }),
            status: "Inactive",
            otp, // Consistent field
            otpExpires,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        // Insert or update inactive user
        await db.collection("users").updateOne(
            { email },
            { $set: newUser },
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
                  <h3>Email Verification</h3>
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
            message: "User registered. OTP sent to email.",
            userId: user._id.toString(),
            email // For verify
        });

    } catch (error) {
        console.error("Register error:", error);
        res.status(500).json({ success: false, message: "Registration failed" });
    }
};

// ================= VERIFY OTP =================
const verifyOTP = async (req, res) => {
    try {
        const db = getDB();
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ success: false, message: "Email and OTP required" });
        }

        const user = await db.collection("users").findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Check OTP match
        if (user.otp !== otp) {
            return res.status(400).json({ success: false, message: "Invalid OTP" });
        }

        // Check expiry
        if (user.otpExpires && Date.now() > user.otpExpires) {
            return db.collection("users").updateOne(
                { email },
                { $set: { status: "OTP Expired" } }
            );
            return res.status(400).json({ success: false, message: "OTP expired" });
        }

        // Activate user, clear OTP
        await db.collection("users").updateOne(
            { email },
            {
                $set: {
                    status: "Active",
                    updatedAt: new Date()
                },
                $unset: {
                    otp: "",
                    otpExpires: ""
                }
            }
        );

        res.json({ 
            success: true, 
            message: "Email verified successfully. You can now login." 
        });
    } catch (err) {
        console.error("Verify OTP error:", err);
        res.status(500).json({ success: false, message: "Server error verifying OTP" });
    }
};

// ================= REFRESH TOKEN =================
const refreshToken = async (req, res) => {
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

        const user = await db.collection("users").findOne({
            _id: new ObjectId(decoded.id),
            refreshToken
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid refresh token"
            });
        }

        const newAccessToken = generateAccessToken(user);

        res.json({
            success: true,
            accessToken: newAccessToken
        });

    } catch (error) {
        res.status(401).json({
            success: false,
            message: "Invalid refresh token"
        });
    }
};

module.exports = {
    createRegister,
    loginUser,
    refreshToken,
    verifyOTP,
    findUserByEmail
};
