const express = require("express");
const PORT = 3000;
const path = require("path");
const haki = express();
const cors = require('cors');
const nodemailer = require('nodemailer');
const { admin, handleGoogleLogin } = require("./firebase");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const config = require("../config");
const User = require("./models/User");
const { app, auth } = require("./lib/firebase");


// Connect MongoDB
mongoose.connect(config.DB_HOST, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => console.error("❌ MongoDB Connection Failed:", err));

// Google Signup API
app.post("/api/auth/google-signup", async (req, res) => {
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

haki.use(express.json());
haki.use(cors());
haki.use(express.static(path.join(__dirname, "../public")));

haki.use(express.urlencoded({extended: true}))


haki.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/html/home.html"))
})

haki.post("/google-login", async (req, res) => {
    try {
        const { uid, email, displayName, photoURL } = req.body; // Get data from request body

        if (!uid || !email || !displayName) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        const user = await db.collection("users").findOne({ uid });

        if (user) {
            // User exists, log them in
            const token = jwt.sign({ uid, email }, config.JWT_SECRET, { expiresIn: config.JWT_EXPIRES_IN });
            return res.json({ success: true, message: "Login successful", token, user });
        }

        // User does not exist, create new account
        const newUser = {
            uid,
            email,
            displayName,
            photoURL,
            createdAt: new Date()
        };

        await db.collection("users").insertOne(newUser);

        const token = jwt.sign({ uid, email }, config.JWT_SECRET, { expiresIn: config.JWT_EXPIRES_IN });
        res.json({ success: true, message: "Signup successful", token, user: newUser });

    } catch (error) {
        console.error("Google Login Error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

haki.get("/signup", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/user/signup.html"))
})

haki.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/user/sign-in.html"))
})

haki.get("/airtime", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/user/airtime.html"))
})

haki.get("/airtime2cash", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/user/airtime2cash.html"))
})

haki.get("/cable", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/user/cable.html"))
})

haki.get("/changePin", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/user/change-pin.html"))
})

haki.get("/crypto", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/user/crypto.html"))
})

haki.get("/dashboard", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/user/dashboard.html"))
})

haki.get("/data", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/user/data.html"))
})

haki.get("/docs", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/user/docs.html"))
})

haki.get("/electricity", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/user/electricity.html"))
})

haki.get("/forgotPass", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/user/forgot-password.html"))
})

haki.get("/fundWallet", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/user/fund-wallet.html"))
})

haki.get("/giftcards", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/user/giftcards.html"))
})

haki.get("/gotv", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/user/gotv.html"))
})

haki.get("/investment", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/user/investment.html"))
})

haki.get("/referrals", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/user/referrals.html"))
})

haki.get("/services", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/user/services.html"))
})

haki.get("/settings", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/user/settings.html"))
})

haki.get("/support", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/user/support.html"))
})

haki.get("/transactionDetails", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/user/transaction-details.html"))
})

haki.get("/transaction", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/user/transaction.html"))
})

haki.get("/updatePass", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/user/update-password.html"))
})

haki.get("/virtualCard", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/user/virtual-card.html"))
})

haki.get("/withdraw", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/user/withdraw.html"))
})








haki.listen(PORT, (req, res) => {
    console.log(`server listening at port ${PORT}`)
})

