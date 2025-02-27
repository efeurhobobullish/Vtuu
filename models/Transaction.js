const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, enum: ["airtime", "data", "utility", "crypto"], required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ["pending", "successful", "failed"], default: "pending" },
  reference: { type: String, unique: true, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Transaction", TransactionSchema);