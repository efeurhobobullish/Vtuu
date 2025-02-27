const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");

const verifyAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    if (!decoded.isAdmin) return res.status(403).json({ error: "Access denied" });
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ error: "Invalid token" });
  }
};

module.exports = { verifyAdmin };
