const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const hashPassword = async (password) => await bcrypt.hash(password, 10);

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, role: user.role, clinicId: user.clinicId },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );
};

module.exports = { hashPassword, generateToken };