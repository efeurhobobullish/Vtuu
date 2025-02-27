const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

// Get User Profile
router.get('/profile', authMiddleware, async (req, res) => {
    const user = await User.findById(req.session.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
});

module.exports = router;