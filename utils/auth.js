const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");

const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

const generateToken = (user) => {
  return jwt.sign({ id: user._id, isAdmin: user.isAdmin }, SECRET_KEY, { expiresIn: "7d" });
};

module.exports = { hashPassword, comparePassword, generateToken };
