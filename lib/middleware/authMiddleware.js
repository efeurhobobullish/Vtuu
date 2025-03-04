const jwt = require("jsonwebtoken");
const config = require("../../config");

const authMiddleware = (req, res, next) => {
    console.log("Request Headers:", req.headers);
    const authHeader = req.headers.authorization;
    const bearerToken = req.headers['authorization-bearer'];
    const tokenFromQuery = req.query.token;

    let token;
    if (authHeader) {
        token = authHeader.startsWith('Bearer ') 
            ? authHeader.split(' ')[1] 
            : authHeader;
    } 
    // Check alternative Bearer token header
    else if (bearerToken) {
        token = bearerToken;
    } 
    // Check token in query parameters as a fallback
    else if (tokenFromQuery) {
        token = tokenFromQuery;
    }

    if (!token) {
        return res.status(401).json({ 
            success: false, 
            message: "Access denied. No token provided!",
            details: {
                authHeader: !!authHeader,
                bearerToken: !!bearerToken,
                queryToken: !!tokenFromQuery
            }
        });
    }

    try {
        const decoded = jwt.verify(token, config.JWT_SECRET);
        req.user = decoded; // Attach user info to request
        next();
    } catch (error) {
        console.error("Token Verification Error:", error);
        res.status(401).json({ 
            success: false, 
            message: "Invalid or expired token!",
            error: error.message 
        });
    }
};

module.exports = authMiddleware;