const mongoose = require("mongoose");

const ServiceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ["airtime", "data", "utility"], required: true },
  price: { type: Number, required: true },
  provider: { type: String, required: true }
});

module.exports = mongoose.model("Service", ServiceSchema);