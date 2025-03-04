const jwt = require("jsonwebtoken");
const config = require("../../config");

const authMiddleware = (req, res, next) => {
    const authHeader = req.header("Authorization");
    console.log("Authorization Header:", authHeader); // Debugging line

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ success: false, message: "Access denied. No token provided!" });
    }

    const token = authHeader.split(" ")[1]; // Extract token after "Bearer"
    console.log("Extracted Token:", token); // Debugging line

    try {
        const decoded = jwt.verify(token, config.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(400).json({ success: false, message: "Invalid token!" });
    }
};

module.exports = authMiddleware;