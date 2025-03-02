const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const config = require("../config"); // Import config.js

const PORT = config.PORT || 3000;
const MONGO_URI = config.MONGO_URI; // Use full MongoDB URL from config.js

const app = express();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

// MongoDB Connection
mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// Serve HTML pages dynamically
const pages = [
  "home", "signup", "sign-in", "airtime", "airtime2cash", "cable", "change-pin",
  "crypto", "dashboard", "data", "docs", "electricity", "forgot-password",
  "fund-wallet", "giftcards", "gotv", "investment", "referrals", "services",
  "settings", "support", "transaction-details", "transaction", "update-password",
  "virtual-card", "withdraw"
];

pages.forEach((page) => {
  app.get(`/${page === "home" ? "" : page}`, (req, res) => {
    res.sendFile(path.join(__dirname, `../public/user/${page}.html`));
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
