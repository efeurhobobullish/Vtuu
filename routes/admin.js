const express = require("express");
const router = express.Router();
const Admin = require("../models/Admin");
const User = require("../models/User");
const Transaction = require("../models/Transaction");
const Service = require("../models/Service");
const { hashPassword, comparePassword, generateToken } = require("../utils/auth");
const { updateWallet } = require("../utils/wallet");

// Middleware to check if user is an admin
const isAdmin = async (req, res, next) => {
  const admin = await Admin.findById(req.user.id);
  if (!admin) return res.status(403).json({ error: "Access denied. Admin only." });
  next();
};

// **(1) Admin Login**
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });
    if (!admin || !(await comparePassword(password, admin.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = generateToken(admin);
    res.json({ token, admin });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// **(2) Get Dashboard Summary**
router.get("/dashboard", isAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalTransactions = await Transaction.countDocuments();
    const totalRevenue = await Transaction.aggregate([{ $group: { _id: null, total: { $sum: "$amount" } } }]);

    res.json({
      totalUsers,
      totalTransactions,
      totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// **(3) Get All Users**
router.get("/users", isAdmin, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// **(4) Fund User Wallet**
router.post("/fund-wallet", isAdmin, async (req, res) => {
  try {
    const { userId, amount } = req.body;
    const newBalance = await updateWallet(userId, amount, "credit");
    res.json({ message: "Wallet funded successfully", newBalance });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// **(5) View All Transactions**
router.get("/transactions", isAdmin, async (req, res) => {
  try {
    const transactions = await Transaction.find().populate("userId", "fullName email");
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// **(6) Manage Services (Add, Update, Delete)**
router.post("/services", isAdmin, async (req, res) => {
  try {
    const { name, type, price, provider } = req.body;
    const newService = new Service({ name, type, price, provider });
    await newService.save();
    res.json({ message: "Service added successfully", newService });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/services/:id", isAdmin, async (req, res) => {
  try {
    const { name, type, price, provider } = req.body;
    const updatedService = await Service.findByIdAndUpdate(req.params.id, { name, type, price, provider }, { new: true });
    res.json({ message: "Service updated successfully", updatedService });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/services/:id", isAdmin, async (req, res) => {
  try {
    await Service.findByIdAndDelete(req.params.id);
    res.json({ message: "Service deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
