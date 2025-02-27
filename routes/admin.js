const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { verifyAdmin } = require("../middleware/auth");
const { SECRET_KEY } = require("../config");

const Admin = require("../models/Admin");
const User = require("../models/User");
const Transaction = require("../models/Transaction");
const Service = require("../models/Service");

/**
 * Admin Login
 */
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const admin = await Admin.findOne({ username });

    if (!admin) return res.status(400).json({ error: "Admin not found" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: admin._id, isAdmin: true }, SECRET_KEY, { expiresIn: "7d" });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get Dashboard Stats
 */
router.get("/dashboard", verifyAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalTransactions = await Transaction.countDocuments();
    const totalRevenue = await Transaction.aggregate([{ $group: { _id: null, total: { $sum: "$amount" } } }]);

    res.json({
      totalUsers,
      totalTransactions,
      totalRevenue: totalRevenue.length ? totalRevenue[0].total : 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get All Users
 */
router.get("/users", verifyAdmin, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Delete User
 */
router.delete("/users/:id", verifyAdmin, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get All Transactions
 */
router.get("/transactions", verifyAdmin, async (req, res) => {
  try {
    const transactions = await Transaction.find().sort({ createdAt: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get All Services
 */
router.get("/services", verifyAdmin, async (req, res) => {
  try {
    const services = await Service.find();
    res.json(services);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Create New Service
 */
router.post("/services", verifyAdmin, async (req, res) => {
  try {
    const { name, price, description } = req.body;
    const newService = new Service({ name, price, description });
    await newService.save();
    res.json(newService);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Update Service
 */
router.put("/services/:id", verifyAdmin, async (req, res) => {
  try {
    const updatedService = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedService);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Delete Service
 */
router.delete("/services/:id", verifyAdmin, async (req, res) => {
  try {
    await Service.findByIdAndDelete(req.params.id);
    res.json({ message: "Service deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
