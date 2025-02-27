const express = require("express");
const router = express.Router();
const { initializePayment, verifyPayment } = require("../utils/paystack");
const { updateWallet } = require("../utils/wallet");

// Initialize Paystack Payment
router.post("/pay", async (req, res) => {
  try {
    const { email, amount } = req.body;
    const paymentData = await initializePayment(email, amount);
    res.json(paymentData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verify Paystack Payment
router.get("/verify/:reference", async (req, res) => {
  try {
    const { reference } = req.params;
    const paymentData = await verifyPayment(reference);

    if (paymentData.status === "success") {
      await updateWallet(paymentData.customer.id, paymentData.amount / 100, "credit");
      return res.json({ message: "Payment successful", paymentData });
    }

    res.status(400).json({ error: "Payment verification failed" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
