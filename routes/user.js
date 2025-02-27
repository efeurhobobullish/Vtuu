const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { hashPassword, comparePassword, generateToken } = require("../utils/auth");

// Register User
router.post("/register", async (req, res) => {
  try {
    const { fullName, email, phone, password } = req.body;
    const hashedPassword = await hashPassword(password);

    const user = new User({ fullName, email, phone, password: hashedPassword });
    await user.save();
    res.json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// User Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await comparePassword(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = generateToken(user);
    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
