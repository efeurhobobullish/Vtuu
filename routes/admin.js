const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Transaction = require("../models/Transaction");
const Admin = require("../models/Admin");
const { authenticateAdmin } = require("../middleware/auth");

// Admin Login
router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const admin = await Admin.findOne({ email });
        if (!admin) return res.status(400).json({ error: "Admin not found!" });

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) return res.status(400).json({ error: "Invalid password!" });

        const token = jwt.sign({ id: admin._id }, "SECRET_KEY", { expiresIn: "2h" });
        res.json({ message: "Login successful", token });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Admin Dashboard Stats
router.get("/stats", authenticateAdmin, async (req, res) => {
    try {
        const users = await User.countDocuments();
        const transactions = await Transaction.countDocuments();
        const revenue = await Transaction.aggregate([{ $group: { _id: null, total: { $sum: "$amount" } } }]);

        res.json({
            users,
            transactions,
            revenue: revenue.length > 0 ? revenue[0].total : 0
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get All Users
router.get("/users", authenticateAdmin, async (req, res) => {
    try {
        const users = await User.find({}, { password: 0 });
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update User Balance
router.put("/user/:id/balance", authenticateAdmin, async (req, res) => {
    const { id } = req.params;
    const { balance } = req.body;
    try {
        await User.findByIdAndUpdate(id, { balance });
        res.json({ message: "Balance updated successfully!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete User
router.delete("/user/:id", authenticateAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        await User.findByIdAndDelete(id);
        res.json({ message: "User deleted successfully!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get All Transactions
router.get("/transactions", authenticateAdmin, async (req, res) => {
    try {
        const transactions = await Transaction.find();
        res.json(transactions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update Transaction Status
router.put("/transaction/:id", authenticateAdmin, async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        await Transaction.findByIdAndUpdate(id, { status });
        res.json({ message: "Transaction updated successfully!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add New Admin
router.post("/add-admin", authenticateAdmin, async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newAdmin = new Admin({ name, email, password: hashedPassword });
        await newAdmin.save();
        res.json({ message: "Admin added successfully!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
