const jwt = require('jsonwebtoken');

const verifyToken = (token) => {
  // Uses the secret from your Render Env Vars
  return jwt.verify(token, process.env.JWT_SECRET);
};

// ✅ Exporting as an object so it matches the { verifyToken } import
module.exports = { verifyToken };