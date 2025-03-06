const express = require("express");  
const mongoose = require("mongoose");  
const cors = require("cors");  
const config = require("../config");  
const path = require("path");

const app = express();
const PORT = 3000;  

// Middleware  
app.use(cors());  
app.use(express.json());  
app.use(express.urlencoded({ extended: true }));  

// User Schema & Model  
const UserSchema = new mongoose.Schema({  
    username: { type: String, required: true },  
    email: { type: String, required: true, unique: true },  
    password: { type: String, required: true },  
    balance: { type: Number, default: 0.00 }  
}, { timestamps: true });  

const User = mongoose.model("User", UserSchema);  

// Connect to MongoDB  
async function connectDB() {  
    try {  
        await mongoose.connect(config.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });  
        console.log("✅ Connected to MongoDB...");
    } catch (error) {  
        console.error("❌ MongoDB Connection Error:", error.message);  
        process.exit(1);  
    }  
}  
connectDB();  

// Signup (No verification, stores data only)  
app.post("/signup", async (req, res) => {  
    try {  
        const { username, email, password } = req.body;  

        if (!username || !email || !password) {  
            return res.status(400).json({ success: false, message: "All fields are required!" });  
        }  

        // Check if user already exists  
        const existingUser = await User.findOne({ email });  
        if (existingUser) {  
            return res.status(400).json({ success: false, message: "Email already exists!" });  
        }  

        // Create and save user  
        const newUser = new User({ username, email, password });  
        await newUser.save();  

        res.json({ success: true, message: "User registered successfully!" });  
    } catch (error) {  
        console.error("Signup Error:", error);  
        res.status(500).json({ success: false, message: "Server error!" });  
    }  
});  

// Login (No verification, just returns user data)  
app.post("/login", async (req, res) => {  
    try {  
        const { email } = req.body;  

        if (!email) {  
            return res.status(400).json({ success: false, message: "Email is required!" });  
        }  

        // Find user  
        const user = await User.findOne({ email });  
        if (!user) {  
            return res.status(400).json({ success: false, message: "User not found!" });  
        }  

        res.json({   
            success: true,   
            message: "Login successful!",   
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

//dashboard 
app.get("/dashboard",async (req, res) => {
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
app.get("/api/user/balance",async (req, res) => {
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
app.get("/dashboard", (req, res) => {
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
