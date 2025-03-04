const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const cors = require("cors");
const path = require("path");
const config = require("../config");
const authMiddleware = require("./middleware/authMiddleware");
const app = express(); // Initialize Express
const PORT = 3000;

// Middleware
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON request body
app.use(express.urlencoded({ extended: true })); // Parse form data

// Connect to MongoDB
async function connectDB() {
    try {
        await mongoose.connect(config.MONGO_URI, { 
            useNewUrlParser: true, 
            useUnifiedTopology: true 
        });

        console.log("✅ Connected to MongoDB...");

        // Ensure the field name matches your schema (change to `isVerified` if needed)
        const updateResult = await User.updateMany(
            { isVerified: { $exists: false } },  // Only update if field doesn't exist
            { $set: { isVerified: false } }
        );

        console.log(`✅ Updated ${updateResult.modifiedCount} users with 'isVerified: false'`);

    } catch (error) {
        console.error("❌ MongoDB Connection Error:", error.message);
        process.exit(1); // Stop the server if DB connection fails
    }
}

connectDB();

// Signup Endpoint
app.post("/signup", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "Email already exists!" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = new User({
            email,
            password: hashedPassword, // ✅ Store hashed password
            isVerified: false, // Default: user not verified
        });

        await newUser.save();

        res.json({ success: true, message: "User registered successfully! Please verify your email." });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error!" });
    }
});


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
      from: `"EmpirePay Vtu" <noreply@https://testpay-61h6.onrender.com>`,
      to,
      subject,
      text,
      html, // ✅ Now supports HTML emails
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${to}`);
  } catch (error) {
    console.error(`❌ Email Error: ${error.message}`);
  }
};

// User Schema & Model
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    verified: { type: Boolean, default: false }, // ✅ Add this field
}, { timestamps: true });

const User = mongoose.model("User", UserSchema);

// Function to generate JWT token
function generateToken(user) {
  return jwt.sign({ id: user._id }, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES_IN,
  });
}

// Forgot Password
app.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: "Email is required!" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: "User not found!" });

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
    await user.save();

    const resetLink = `https://testpay-61h6.onrender.com/reset-password?token=${resetToken}&email=${email}`;
    await sendEmail(email, "Reset Your Password - EmpirePay", `Click to reset password: ${resetLink}`);

    res.json({ success: true, message: "Password reset link sent! Check your email." });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ success: false, message: "Server error, please try again!" });
  }
});

// Reset Password
app.post("/reset-password", async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;
    if (!email || !token || !newPassword) return res.status(400).json({ success: false, message: "All fields are required!" });
    if (newPassword.length < 6) return res.status(400).json({ success: false, message: "Password must be at least 6 characters!" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: "User not found!" });

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    if (!user.resetPasswordToken || user.resetPasswordToken !== tokenHash || user.resetPasswordExpires < Date.now()) {
      return res.status(400).json({ success: false, message: "Invalid or expired token!" });
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


// Verify Email
app.get("/verify-email", async (req, res) => {
    try {
        const { token } = req.query;

        if (!token) {
            return res.status(400).json({ success: false, message: "Invalid verification link!" });
        }

        const decoded = jwt.verify(token, config.JWT_SECRET);
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(400).json({ success: false, message: "User not found!" });
        }

        if (user.isVerified) {
            return res.json({ success: true, message: "Email already verified! You can log in now." });
        }

        user.isVerified = true;
        await user.save();

        res.json({ success: true, message: "Email verified successfully!" });
    } catch (error) {
        res.status(400).json({ success: false, message: "Invalid or expired token!" });
    }
});

// Login
app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user in DB
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, message: "User not found!" });
        }

        // Check if email is verified
        if (!user.isVerified) {
            return res.status(400).json({ success: false, message: "Please verify your email first!" });
        }

        // Compare password with hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Invalid password!" });
        }

        // Generate JWT Token
        const token = jwt.sign({ userId: user._id }, config.JWT_SECRET, { expiresIn: "7d" });

        res.json({ success: true, message: "Login successful!", token });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error!" });
    }
});

//dashboard 
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
app.get("/verify-email", (req, res) => res.sendFile(path.join(__dirname, "../public/user/verify-email.html")));
app.get("/withdraw", (req, res) => res.sendFile(path.join(__dirname, "../public/user/withdraw.html")));

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});