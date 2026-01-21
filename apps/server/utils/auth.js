const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const hashPassword = async (password) => {
  return bcrypt.hash(password, 10);
};

const generateToken = (worker) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is missing in environment variables");
  }
  return jwt.sign(
    { id: worker.id, role: worker.role, clinicName: worker.clinicName },
    process.env.JWT_SECRET,
    { expiresIn: "8h" }
  );
};

module.exports = { hashPassword, generateToken };
