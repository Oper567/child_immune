const { verifyToken } = require('../utils/auth.js');

const protect = (req, res, next) => {
  // 1. Get token from the 'Authorization' header
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: "No token provided. Access denied." });
  }

  const token = authHeader.split(' ')[1];

  // 2. Verify the token
  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({ error: "Invalid or expired session. Please login again." });
  }

  // 3. Attach worker info to the request object
  // This allows the next function to know WHO is making the change (Audit Trail)
  req.worker = decoded;
  
  next();
};

module.exports = { protect };