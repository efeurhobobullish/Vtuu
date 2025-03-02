const express = require("express");
const path = require("path");
const haki = express();
const cors = require('cors');
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const { admin, User } = require("./firebase");
const config = require("../config");

// Connect MongoDB
mongoose.connect(config.DB_HOST, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => console.error("❌ MongoDB Connection Failed:", err));

haki.use(express.json());
haki.use(cors());
haki.use(express.static(path.join(__dirname, "../public")));
haki.use(express.urlencoded({ extended: true }));

// Google Signup API
haki.post("/api/auth/google-signup", async (req, res) => {
    try {
        const { idToken } = req.body;
        if (!idToken) return res.status(400).json({ success: false, message: "❌ No ID Token provided!" });

        // Verify Google ID Token
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const { uid, email, name, picture } = decodedToken;

        // Check if user exists in MongoDB
        let user = await User.findOne({ email });

        if (!user) {
            // Create new user
            user = new User({
                uid,
                email,
                name,
                picture,
                provider: "google",
                createdAt: new Date(),
            });

            await user.save();
        }

        // Generate JWT Token
        const token = jwt.sign({ userId: user._id, email: user.email }, config.JWT_SECRET, { expiresIn: config.JWT_EXPIRES_IN });

        res.json({
            success: true,
            message: "✅ Google Signup Successful!",
            token,
            user,
        });
    } catch (error) {
        console.error("Google Signup Error:", error);
        res.status(500).json({ success: false, message: "❌ Google Signup Failed!" });
    }
});

// Google Login API
haki.post("/auth/google", async (req, res) => {
    try {
        const { idToken } = req.body;
        if (!idToken) return res.status(400).json({ error: "Missing Google ID token" });

        // Verify Google token with Firebase
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const { uid, email, name, picture } = decodedToken;

        // Check if user exists in MongoDB
        let user = await User.findOne({ uid });
        if (!user) {
            // New user, store in database
            user = await User.create({ uid, email, name, picture });
        }

        // Generate a JWT token for session
        const token = jwt.sign({ uid, email, name, picture }, config.JWT_SECRET, { expiresIn: config.JWT_EXPIRES_IN });

        return res.json({ success: true, token, user });
    } catch (error) {
        return res.status(401).json({ error: "Invalid Google ID token" });
    }
});

// Serving static pages
const pages = [
    "signup", "login", "airtime", "airtime2cash", "cable", "changePin", 
    "crypto", "dashboard", "data", "docs", "electricity", "forgotPass", 
    "fundWallet", "giftcards", "gotv", "investment", "referrals", "services", 
    "settings", "support", "transactionDetails", "transaction", "updatePass", 
    "virtualCard", "withdraw"
];

pages.forEach(page => {
    haki.get(`/${page}`, (req, res) => {
        res.sendFile(path.join(__dirname, `../public/user/${page}.html`));
    });
});

// Homepage route
haki.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/html/home.html"));
});

// Start server
haki.listen(config.PORT || 3000, () => {
    console.log(`Server listening at port ${config.PORT || 3000}`);
});
