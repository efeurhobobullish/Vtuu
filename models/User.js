const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    phone: { type: String, unique: true },
    password: String,
    isVerified: { type: Boolean, default: false },
    otp: { type: String, required: false },
    otpExpires: { type: Date, required: false }
});

module.exports = mongoose.model("User", UserSchema);