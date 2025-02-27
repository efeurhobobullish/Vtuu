const User = require("../models/User");

/**
 * Middleware to check if the user has sufficient wallet balance
 */
const checkWalletBalance = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const { amount } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ error: "Invalid amount" });

    if (user.walletBalance < amount) {
      return res.status(400).json({ error: "Insufficient wallet balance" });
    }

    req.user.walletBalance = user.walletBalance;
    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Middleware to deduct wallet balance after a successful transaction
 */
const deductWalletBalance = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.walletBalance -= req.body.amount;
    await user.save();

    req.user.walletBalance = user.walletBalance;
    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { checkWalletBalance, deductWalletBalance };
