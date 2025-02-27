const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { generateOTP, sendOTPviaSMS, sendOTPviaEmail } = require("../lib/otp");
const config = require("../config");

const router = express.Router();

// Register User
router.post("/register", async (req, res) => {
    const { name, email, phone, password, otpMethod } = req.body;

    // Validate input
    if (!name || !email || !phone || !password || !otpMethod) {
        return res.status(400).json({ error: "All fields are required" });
    }

    try {
        const userExists = await User.findOne({ $or: [{ email }, { phone }] });
        if (userExists) return res.status(400).json({ error: "User already exists" });

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate OTP
        const otp = generateOTP();
        const otpExpires = new Date(Date.now() + 5 * 60000); // 5 min expiry

        // Create user
        const user = new User({ name, email, phone, password: hashedPassword, otp, otpExpires });
        await user.save();

        // Send OTP via chosen method
        if (otpMethod === "sms") {
            await sendOTPviaSMS(phone, otp);
        } else {
            await sendOTPviaEmail(email, otp);
        }

        res.json({ message: "OTP sent successfully. Verify your account." });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// Verify OTP
router.post("/verify-otp", async (req, res) => {
    const { email, otp } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user || user.otp !== otp || new Date() > user.otpExpires) {
            return res.status(400).json({ error: "Invalid or expired OTP" });
        }

        user.isVerified = true;
        user.otp = null;
        user.otpExpires = null;
        await user.save();

        res.json({ message: "Account verified successfully" });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// Login
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

        if (!user.isVerified) {
            return res.status(403).json({ error: "Account not verified" });
        }

        const token = jwt.sign({ id: user._id }, config.JWT_SECRET, { expiresIn: "1h" });

        res.json({ message: "Login successful", token });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;