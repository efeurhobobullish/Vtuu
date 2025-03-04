const jwt = require("jsonwebtoken");
const config = require("../../config");

const authMiddleware = (req, res, next) => {
    const token = req.header("Authorization"); // Get token from header

    if (!token) {
        return res.status(401).json({ success: false, message: "Access denied. No token provided!" });
    }

    try {
        const decoded = jwt.verify(token.replace("Bearer ", ""), config.JWT_SECRET);
        req.user = decoded; // Attach user info to request
        next();
    } catch (error) {
        res.status(401).json({ success: false, message: "Invalid or expired token!" });
    }
};

module.exports = authMiddleware;