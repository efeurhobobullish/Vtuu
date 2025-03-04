const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const cors = require("cors");
const path = require("path");
const crypto = require("crypto"); // Added missing crypto import
const config = require("../config");
const authMiddleware = require("./middleware/authMiddleware");
const app = express(); // Initialize Express
const PORT = 3000;

// Middleware
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON request body
app.use(express.urlencoded({ extended: true })); // Parse form data

// User Schema & Model - Moved up to ensure it's defined before use
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    balance: { type: Number, default: 0.00 },
    verified: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    resetPasswordToken: String,
    resetPasswordExpires: Date
}, { timestamps: true });

const User = mongoose.model("User", UserSchema);

// Connect to MongoDB
async function connectDB() {
    try {
        await mongoose.connect(config.MONGO_URI, { 
            useNewUrlParser: true, 
            useUnifiedTopology: true 
        });

        console.log("✅ Connected to MongoDB...");

        // Update to check both verification fields for consistency
        const updateResult = await User.updateMany(
            { $or: [
                { isVerified: { $exists: false } },
                { verified: { $exists: false } }
            ]},
            { $set: { 
                isVerified: false,
                verified: false 
            }}
        );

        console.log(`✅ Updated ${updateResult.modifiedCount} users with verification fields`);

    } catch (error) {
        console.error("❌ MongoDB Connection Error:", error.message);
        process.exit(1); // Stop the server if DB connection fails
    }
}

connectDB();

// Configure Nodemailer
const transporter = nodemailer.createTransport({
  host: config.EMAIL_HOST,
  port: config.EMAIL_PORT,
  secure: false,
  auth: {
    user: config.EMAIL_USER,
    pass: config.EMAIL_PASSWORD,
  },
});

// Function to Send Emails (Supports HTML)
const sendEmail = async (to, subject, text, html) => {
  try {
    const mailOptions = {
      from: `"EmpirePay Vtu" <noreply@testpay-61h6.onrender.com>`,
      to,
      subject,
      text,
      html, // ✅ Now supports HTML emails
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${to}`);
    return true;
  } catch (error) {
    console.error(`❌ Email Error: ${error.message}`);
    return false;
  }
};

// Function to generate JWT token - Consistent token generation
function generateToken(userId) {
  return jwt.sign({ id: userId }, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES_IN || "7d",
  });
}

// Signup Endpoint
app.post("/signup", async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: "Username, email and password are required!" 
            });
        }

        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ 
                success: false, 
                message: "Email already exists!" 
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            isVerified: false,
            verified: false
        });

        await newUser.save();

        // Generate verification token
        const verificationToken = generateToken(newUser._id);
        
        // Send verification email
        const verificationLink = `https://testpay-61h6.onrender.com/verify-email?token=${verificationToken}`;
        const emailSent = await sendEmail(
            email,
            "Verify Your Email - EmpirePay",
            `Please click on this link to verify your email: ${verificationLink}`,
            `<p>Welcome to EmpirePay!</p><p>Please click <a href="${verificationLink}">here</a> to verify your email.</p>`
        );

        res.json({ 
            success: true, 
            message: "User registered successfully! Please verify your email.",
            emailSent: emailSent
        });
    } catch (error) {
        console.error("Signup Error:", error);
        res.status(500).json({ success: false, message: "Server error!" });
    }
});

// Login
app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: "Email and password are required!" 
            });
        }

        // Find user in DB
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, message: "User not found!" });
        }

        // Check if email is verified - check both fields for backwards compatibility
        if (!user.isVerified && !user.verified) {
            return res.status(400).json({ 
                success: false, 
                message: "Please verify your email first!" 
            });
        }

        // Compare password with hashed password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Invalid password!" });
        }

        // Generate JWT Token
        const token = generateToken(user._id);

        res.json({ 
            success: true, 
            message: "Login successful!", 
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ success: false, message: "Server error!" });
    }
});

// Verify Email
app.get("/verify-email", async (req, res) => {
    try {
        const { token } = req.query;

        if (!token) {
            return res.status(400).json({ success: false, message: "Invalid verification link!" });
        }

        try {
            const decoded = jwt.verify(token, config.JWT_SECRET);
            const user = await User.findById(decoded.id);

            if (!user) {
                return res.status(400).json({ success: false, message: "User not found!" });
            }

            if (user.isVerified || user.verified) {
                return res.json({ success: true, message: "Email already verified! You can log in now." });
            }

            // Update both fields for consistency
            user.isVerified = true;
            user.verified = true;
            await user.save();

            // Redirect to login page or show verification success page
            res.json({ success: true, message: "Email verified successfully! You can now log in." });
        } catch (jwtError) {
            console.error("JWT Verification Error:", jwtError);
            return res.status(400).json({ success: false, message: "Invalid or expired token!" });
        }
    } catch (error) {
        console.error("Verify Email Error:", error);
        res.status(400).json({ success: false, message: "Invalid or expired token!" });
    }
});

// Forgot Password
app.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: "Email is required!" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: "User not found!" });

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save();

    const resetLink = `https://testpay-61h6.onrender.com/reset-password?token=${resetToken}&email=${email}`;
    const emailSent = await sendEmail(
        email, 
        "Reset Your Password - EmpirePay", 
        `Click to reset password: ${resetLink}`,
        `<p>You requested a password reset.</p><p>Click <a href="${resetLink}">here</a> to reset your password.</p>`
    );

    res.json({ 
        success: true, 
        message: "Password reset link sent! Check your email.",
        emailSent: emailSent
    });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ success: false, message: "Server error, please try again!" });
  }
});

// Reset Password
app.post("/reset-password", async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;
    if (!email || !token || !newPassword) {
        return res.status(400).json({ 
            success: false, 
            message: "All fields are required!" 
        });
    }
    
    if (newPassword.length < 6) {
        return res.status(400).json({ 
            success: false, 
            message: "Password must be at least 6 characters!" 
        });
    }

    const user = await User.findOne({ email });
    if (!user) {
        return res.status(404).json({ 
            success: false, 
            message: "User not found!" 
        });
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    if (!user.resetPasswordToken || 
        user.resetPasswordToken !== tokenHash || 
        user.resetPasswordExpires < Date.now()) {
      return res.status(400).json({ 
          success: false, 
          message: "Invalid or expired token!" 
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ success: true, message: "Password reset successful!" });
  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({ success: false, message: "Server error!" });
  }
});

// Dashboard
app.get("/api/dashboard", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found!" });
        }

        res.json({
            success: true,
            message: "Dashboard data retrieved successfully",
            data: {
                username: user.username,
                email: user.email,
                balance: user.balance
            }
        });
    } catch (error) {
        console.error("Error retrieving dashboard data:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// Get User Balance
app.get("/api/user/balance", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        
        res.json({ success: true, balance: user.balance });
    } catch (error) {
        console.error("Error fetching balance:", error);
        res.status(500).json({ success: false, message: "Error fetching balance" });
    }
});

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Serve HTML pages
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "../public/user/docs.html")));
app.get("/signup", (req, res) => res.sendFile(path.join(__dirname, "../public/user/signup.html")));
app.get("/login", (req, res) => res.sendFile(path.join(__dirname, "../public/user/sign-in.html")));
app.get("/airtime", (req, res) => res.sendFile(path.join(__dirname, "../public/user/airtime.html")));
app.get("/airtime2cash", (req, res) => res.sendFile(path.join(__dirname, "../public/user/airtime2cash.html")));
app.get("/cable", (req, res) => res.sendFile(path.join(__dirname, "../public/user/cable.html")));
app.get("/changePin", (req, res) => res.sendFile(path.join(__dirname, "../public/user/change-pin.html")));
app.get("/crypto", (req, res) => res.sendFile(path.join(__dirname, "../public/user/crypto.html")));
app.get("/dashboard", authMiddleware, (req, res) => {
    res.sendFile(path.join(__dirname, "../public/user/dashboard.html"));
});
app.get("/data", (req, res) => res.sendFile(path.join(__dirname, "../public/user/data.html")));
app.get("/docs", (req, res) => res.sendFile(path.join(__dirname, "../public/user/docs.html")));
app.get("/electricity", (req, res) => res.sendFile(path.join(__dirname, "../public/user/electricity.html")));
app.get("/forgotPass", (req, res) => res.sendFile(path.join(__dirname, "../public/user/forgot-password.html")));
app.get("/fundWallet", (req, res) => res.sendFile(path.join(__dirname, "../public/user/fund-wallet.html")));
app.get("/giftcards", (req, res) => res.sendFile(path.join(__dirname, "../public/user/giftcards.html")));
app.get("/gotv", (req, res) => res.sendFile(path.join(__dirname, "../public/user/gotv.html")));
app.get("/investment", (req, res) => res.sendFile(path.join(__dirname, "../public/user/investment.html")));
app.get("/referrals", (req, res) => res.sendFile(path.join(__dirname, "../public/user/referrals.html")));
app.get("/services", (req, res) => res.sendFile(path.join(__dirname, "../public/user/services.html")));
app.get("/settings", (req, res) => res.sendFile(path.join(__dirname, "../public/user/settings.html")));
app.get("/support", (req, res) => res.sendFile(path.join(__dirname, "../public/user/support.html")));
app.get("/transactionDetails", (req, res) => res.sendFile(path.join(__dirname, "../public/user/transaction-details.html")));
app.get("/transaction", (req, res) => res.sendFile(path.join(__dirname, "../public/user/transaction.html")));
app.get("/updatePass", (req, res) => res.sendFile(path.join(__dirname, "../public/user/update-password.html")));
app.get("/verify-email", (req, res) => res.sendFile(path.join(__dirname, "../public/user/verify-email.html")));
app.get("/withdraw", (req, res) => res.sendFile(path.join(__dirname, "../public/user/withdraw.html")));

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});