const express = require("express");  
const path = require("path");
const mongoose = require("mongoose");  
const cors = require("cors");  
const bcrypt = require( "bcryptjs");  
const config = require("./config"); // Adjust path if needed

const app = express();
const PORT = process.env.PORT || 3000;  

// Middleware  
app.use(cors());  
app.use(express.json());  
app.use(express.urlencoded({ extended: true }));  

// User Schema & Model
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    balance: { type: Number, default: 0.00 },
    telegramId: { type: String, sparse: true }
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

// Signup (With Password Hashing)
app.post("/signup", async (req, res,next) => {
    try {
        const { username, email, phone, password } = req.body;
        if (!username || !email || !phone || !password) {
            return res.status(400).json({ success: false, message: "All fields are required!" });
        }
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ success: false, message: "Email already exists!" });
        }
        const existingPhone = await User.findOne({ phone });
        if (existingPhone) {
            return res.status(400).json({ success: false, message: "Phone number already exists!" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, email, phone, password: hashedPassword });
        await newUser.save();
        res.json({ success: true, message: "User registered successfully!" });
    } catch (error) {
        console.error("Signup Error:", error);
        next(error); 
    }
});

// Login (With Password Check)
app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        
        console.log("Login attempt:", { email, password });

        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Email and password are required!" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid email or password!" });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ success: false, message: "Invalid email or password!" });
        }

        res.json({
            success: true,
            message: "Login successful!",
            user: { id: user._id, username: user.username, email: user.email }
        });
    } catch (error) {
        console.error("Login Error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
});



// u see this scroll to line 185 and read why i added this
app.post("/recreate-index", async (req, res,next) => {
  try {
    await mongoose.connection.db.collection('users').dropIndex('telegramId_1');
    await mongoose.connection.db.collection('users').createIndex({ telegramId: 1 }, { unique: true, sparse: true });
    res.json({ success: true, message: "Telegram ID index has been recreated!" });
  } catch (error) {
    console.error("Error creating index:", error);
    next(error);
  }
});


// Dashboard (Retrieves user data)
app.post("/dashboard", async (req, res, next) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: "Email is required!" });
        }

        const user = await User.findOne({ email });
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
        next(error); 
    }
});



// Get User Balance
app.get("/api/user/balance", async (req, res,next) => {
    try {
        const { email } = req.query;

        if (!email) {
            return res.status(400).json({ success: false, message: "Email is required!" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found!" });
        }

        res.json({ success: true, balance: user.balance || 0 });
    } catch (error) {
        console.error("Error fetching balance:", error);
        next(error);
    }
});
app.use((err, req, res, next) => {
    console.error("Global Error Handler:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
});


// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Serve HTML pages
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "./public/user/docs.html")));
app.get("/signup", (req, res) => res.sendFile(path.join(__dirname, "./public/user/signup.html")));
app.get("/login", (req, res) => res.sendFile(path.join(__dirname, "./public/user/sign-in.html")));
app.get("/airtime", (req, res) => res.sendFile(path.join(__dirname, "./public/user/airtime.html")));
app.get("/airtime2cash", (req, res) => res.sendFile(path.join(__dirname, "./public/user/airtime2cash.html")));
app.get("/cable", (req, res) => res.sendFile(path.join(__dirname, "./public/user/cable.html")));
app.get("/changePin", (req, res) => res.sendFile(path.join(__dirname, "./public/user/change-pin.html")));
app.get("/crypto", (req, res) => res.sendFile(path.join(__dirname, "./public/user/crypto.html")));
app.get("/dashboard", (req, res) => {
    res.sendFile(path.join(__dirname, "./public/user/dashboard.html"));
});
app.get("/data", (req, res) => res.sendFile(path.join(__dirname, "./public/user/data.html")));
app.get("/docs", (req, res) => res.sendFile(path.join(__dirname, "./public/user/docs.html")));
app.get("/electricity", (req, res) => res.sendFile(path.join(__dirname, "./public/user/electricity.html")));
app.get("/forgotPass", (req, res) => res.sendFile(path.join(__dirname, "./public/user/forgot-password.html")));
app.get("/fundWallet", (req, res) => res.sendFile(path.join(__dirname, "./public/user/fund-wallet.html")));
app.get("/giftcards", (req, res) => res.sendFile(path.join(__dirname, "./public/user/giftcards.html")));
app.get("/gotv", (req, res) => res.sendFile(path.join(__dirname, "./public/user/gotv.html")));
app.get("/investment", (req, res) => res.sendFile(path.join(__dirname, "./public/user/investment.html")));
app.get("/referrals", (req, res) => res.sendFile(path.join(__dirname, "./public/user/referrals.html")));
app.get("/services", (req, res) => res.sendFile(path.join(__dirname, "./public/user/services.html")));
app.get("/settings", (req, res) => res.sendFile(path.join(__dirname, "./public/user/settings.html")));
app.get("/support", (req, res) => res.sendFile(path.join(__dirname, "./public/user/support.html")));
app.get("/transactionDetails", (req, res) => res.sendFile(path.join(__dirname, "./public/user/transaction-details.html")));
app.get("/transaction", (req, res) => res.sendFile(path.join(__dirname, "./public/user/transaction.html")));
app.get("/updatePass", (req, res) => res.sendFile(path.join(__dirname, "./public/user/update-password.html")));
app.get("/verify-email", (req, res) => res.sendFile(path.join(__dirname, "./public/user/verify-email.html")));
app.get("/withdraw", (req, res) => res.sendFile(path.join(__dirname, "./public/user/withdraw.html")));
// empire tech i added this to be able to recreate the Telegram IdIndex cause i cant access your database i hope u understand 
//also you are offline and i am inpatient :)
app.get("/recreate-index", async (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Recreate Index</title>
      <script>
        async function recreateIndex() {
          try {
            const response = await fetch('/recreate-index', { method: 'POST' });
            const data = await response.json();

            if (data.success) {
              alert(data.message);
            } else {
              alert("Failed to recreate the index.");
            }
          } catch (error) {
            alert("Error: " + error.message);
          }
        }
      </script>
    </head>
    <body>
      <button onclick="recreateIndex()">Recreate Telegram ID Index</button>
    </body>
    </html>
  `);
});


app.get("/drop-index-page", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Drop Index Page</title>
      <script>
        async function dropIndex() {
          try {
            const response = await fetch('/drop-userid-index', { method: 'POST' });
            const data = await response.json();
            if (data.success) {
              alert(data.message);
            } else {
              alert('Failed to drop the UserId index.');
            }
          } catch (error) {
            alert('Error: ' + error.message);
          }
        }
      </script>
    </head>
    <body>
      <button onclick="dropIndex()">Drop UserId Index</button>
    </body>
    </html>
  `);
});


app.post("/drop-userid-index", async (req, res) => {
  try {
    await mongoose.connection.db.collection('users').dropIndex('userId_1');
    res.json({ success: true, message: 'UserId index dropped successfully!' });
  } catch (error) {
    console.error("Error dropping index:", error);
    res.status(500).json({ success: false, message: 'Failed to drop the UserId index' });
  }
});
// Start Servers
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
