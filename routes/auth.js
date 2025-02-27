const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { sendVerificationEmail } = require('../utils/mailer');
const crypto = require('crypto');

// Signup Route
router.post('/signup', async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'All fields are required' });

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'Email already registered' });

    const verificationCode = crypto.randomInt(1000, 9999); // 4-digit code

    const newUser = new User({ name, email, password, verificationCode, verified: false });
    await newUser.save();

    await sendVerificationEmail(email, verificationCode);

    res.json({ message: 'Signup successful! Please verify your email.', userId: newUser._id });
});

// Verify Account
router.post('/verify', async (req, res) => {
    const { userId, code } = req.body;
    if (!userId || !code) return res.status(400).json({ error: 'User ID and Code are required' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (user.verificationCode != code) return res.status(400).json({ error: 'Invalid verification code' });

    user.verified = true;
    user.verificationCode = null;
    await user.save();

    res.json({ message: 'Account verified successfully!' });
});

module.exports = router;