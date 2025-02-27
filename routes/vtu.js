const express = require("express");
const router = express.Router();
const { checkWalletBalance, deductWalletBalance } = require("../middleware/wallet");
const { processAirtime, processData, processBillPayment } = require("../utils/vtuUtils");
const auth = require("../middleware/auth");

// 📌 Airtime Purchase Route
router.post("/airtime", auth, checkWalletBalance, async (req, res, next) => {
    try {
        const { network, phone, amount } = req.body;
        if (!network || !phone || !amount) return res.status(400).json({ error: "All fields are required" });

        const transaction = await processAirtime(req.user.id, network, phone, amount);
        if (!transaction.success) return res.status(400).json({ error: transaction.message });

        next(); // Deduct wallet balance
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}, deductWalletBalance);

// 📌 Data Purchase Route
router.post("/data", auth, checkWalletBalance, async (req, res, next) => {
    try {
        const { network, phone, plan } = req.body;
        if (!network || !phone || !plan) return res.status(400).json({ error: "All fields are required" });

        const transaction = await processData(req.user.id, network, phone, plan);
        if (!transaction.success) return res.status(400).json({ error: transaction.message });

        next(); // Deduct wallet balance
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}, deductWalletBalance);

// 📌 Bill Payment Route (Electricity, Cable, etc.)
router.post("/bills", auth, checkWalletBalance, async (req, res, next) => {
    try {
        const { biller, account, amount } = req.body;
        if (!biller || !account || !amount) return res.status(400).json({ error: "All fields are required" });

        const transaction = await processBillPayment(req.user.id, biller, account, amount);
        if (!transaction.success) return res.status(400).json({ error: transaction.message });

        next(); // Deduct wallet balance
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}, deductWalletBalance);

module.exports = router;
