const User = require("../models/User");

const updateWallet = async (userId, amount, operation = "credit") => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  if (operation === "credit") {
    user.walletBalance += amount;
  } else if (operation === "debit" && user.walletBalance >= amount) {
    user.walletBalance -= amount;
  } else {
    throw new Error("Insufficient balance");
  }

  await user.save();
  return user.walletBalance;
};

module.exports = { updateWallet };
