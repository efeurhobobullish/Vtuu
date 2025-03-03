const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const config = require("../config");
const authMiddleware = require("./middleware/authMiddleware");
const crypto = require("crypto");
const PORT = 3000;
const path = require('path');

const app = express();
app.use(express.json());

// Connect to MongoDB
mongoose.connect(`${config.MONGO_URI}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("MongoDB Connected"))
    .catch(err => console.error("MongoDB Connection Error:", err));
    

// Configure Nodemailer
const transporter = nodemailer.createTransport({
    host: config.EMAIL_HOST,
    port: config.EMAIL_PORT,
    secure: false, // Use true for port 465, false for 587 or others
    auth: {
        user: config.EMAIL_USER,
        pass: config.EMAIL_PASSWORD
    }
});

// Function to Send Emails
const sendEmail = async (to, subject, text) => {
    try {
        const mailOptions = {
            from: `"EmpirePay" <noreply@empiretech.biz.id>`, // Updated sender
            to,
            subject,
            text
        };

        await transporter.sendMail(mailOptions);
        console.log(`✅ Email sent to ${to}`);
    } catch (error) {
        console.error(`❌ Email Error: ${error.message}`);
    }
};

app.post("/forgot-password", async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ success: false, message: "Email is required!" });

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ success: false, message: "User not found!" });

        // Generate a password reset token (valid for 15 minutes)
        const resetToken = crypto.randomBytes(32).toString("hex");
        const resetTokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");

        user.resetPasswordToken = resetTokenHash;
        user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 minutes expiration
        await user.save();

        // Send email with reset link
        const resetLink = `https://empirepay.com/reset-password?token=${resetToken}&email=${email}`;
        const emailText = `Hello,\n\nClick the link below to reset your password:\n${resetLink}\n\nEmpirePay Team`;

        await sendEmail(email, "Reset Your Password - EmpirePay", emailText);

        res.json({ success: true, message: "Password reset link sent! Check your email." });
    } catch (error) {
        console.error("Forgot Password Error:", error);
        res.status(500).json({ success: false, message: "Server error, please try again!" });
    }
});

app.post("/reset-password", async (req, res) => {
    try {
        const { email, token, newPassword } = req.body;

        if (!email || !token || !newPassword) {
            return res.status(400).json({ success: false, message: "All fields are required!" });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ success: false, message: "Password must be at least 6 characters!" });
        }

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ success: false, message: "User not found!" });

        const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

        if (!user.resetPasswordToken || user.resetPasswordToken !== tokenHash || user.resetPasswordExpires < Date.now()) {
            return res.status(400).json({ success: false, message: "Invalid or expired token!" });
        }

        // Hash new password
        user.password = await bcrypt.hash(newPassword, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.json({ success: true, message: "Password reset successful! You can now log in." });
    } catch (error) {
        console.error("Reset Password Error:", error);
        res.status(500).json({ success: false, message: "Server error, please try again!" });
    }
});

// User Schema & Model
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, minlength: 6 },
    balance: { type: Number, default: 0 }
});

const User = mongoose.model("User", UserSchema);

// Function to generate JWT token
function generateToken(user) {
    return jwt.sign({ id: user._id }, config.JWT_SECRET, { expiresIn: config.JWT_EXPIRES_IN });
}

// Middleware to authenticate token
function authenticateToken(req, res, next) {
    const token = req.header("Authorization");
    if (!token) return res.status(401).json({ error: "Access denied. No token provided." });

    jwt.verify(token, config.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: "Invalid token." });

        req.user = user;
        next();
    });
}

// Signup Route
app.post("/signup", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validate input
        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: "All fields are required!" });
        }

        if (password.length < 6) {
            return res.status(400).json({ success: false, message: "Password must be at least 6 characters!" });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "Email already registered!" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            verified: false
        });

        await newUser.save();

        // Send verification email
        const verificationLink = `https://empirepay.com/verify-email?email=${email}`;
        const emailText = `Hello ${name},\n\nClick the link below to verify your email:\n${verificationLink}\n\nEmpirePay Team`;

        await sendEmail(email, "Verify Your Email - EmpirePay", emailText);

        res.json({ success: true, message: "Signup successful! Please check your email to verify your account." });

    } catch (error) {
        console.error("Signup Error:", error);
        res.status(500).json({ success: false, message: "Server error, please try again!" });
    }
});


app.get("/verify-email", async (req, res) => {
    try {
        const { email } = req.query;

        if (!email) {
            return res.status(400).json({ success: false, message: "Invalid verification link!" });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found!" });
        }

        if (user.verified) {
            return res.json({ success: true, message: "Email already verified!" });
        }

        // Update user status to verified
        user.verified = true;
        await user.save();

        res.json({ success: true, message: "Email verified successfully! You can now log in." });

    } catch (error) {
        console.error("Verification Error:", error);
        res.status(500).json({ success: false, message: "Server error, please try again!" });
    }
});


// Login Route
app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Email and password are required!" });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found!" });
        }

        if (!user.verified) {
            return res.status(403).json({ success: false, message: "Please verify your email first!" });
        }

        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            return res.status(401).json({ success: false, message: "Invalid password!" });
        }

        const token = jwt.sign({ id: user._id }, config.JWT_SECRET, { expiresIn: config.JWT_EXPIRES_IN });

        res.json({ success: true, message: "Login successful!", token });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ success: false, message: "Server error, please try again!" });
    }
});

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

app.get("/api/user/balance", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId); // Adjust according to your DB structure
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }
        res.json({ success: true, balance: user.balance });
    } catch (error) {
        res.json({ success: false, message: "Error fetching balance" });
    }
});



// Serve HTML pages
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "../public/user/docs.html")));
app.get("/signup", (req, res) => res.sendFile(path.join(__dirname, "../public/user/signup.html")));
app.get("/login", (req, res) => res.sendFile(path.join(__dirname, "../public/user/sign-in.html")));
app.get("/airtime", (req, res) => res.sendFile(path.join(__dirname, "../public/user/airtime.html")));
app.get("/airtime2cash", (req, res) => res.sendFile(path.join(__dirname, "../public/user/airtime2cash.html")));
app.get("/cable", (req, res) => res.sendFile(path.join(__dirname, "../public/user/cable.html")));
app.get("/changePin", (req, res) => res.sendFile(path.join(__dirname, "../public/user/change-pin.html")));
app.get("/crypto", (req, res) => res.sendFile(path.join(__dirname, "../public/user/crypto.html")));
app.get("/dashboard", authMiddleware, (req, res) => { res.sendFile(path.join(__dirname, "../public/user/dashboard.html"));
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
app.get("/virtualCard", (req, res) => res.sendFile(path.join(__dirname, "../public/user/virtual-card.html")));
app.get("/withdraw", (req, res) => res.sendFile(path.join(__dirname, "../public/user/withdraw.html")));

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
