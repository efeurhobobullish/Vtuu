const mongoose = require("mongoose");

const ServiceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, enum: ["data", "airtime", "bills", "crypto"], required: true },
  price: { type: Number, required: true },
  description: { type: String },
  active: { type: Boolean, default: true },
});

module.exports = mongoose.model("Service", ServiceSchema);