const { verifyToken } = require('../utils/jwt');

const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ error: "Access denied. Please log in." });
    }

    // ✅ This is where the "verifyToken is not a function" was happening
    const decoded = verifyToken(token);

    // Attach worker info (id, role, clinicName) to the request object
    req.worker = decoded; 
    
    next();
  } catch (error) {
    console.error("🔒 Auth Error:", error.message);
    return res.status(401).json({ error: "Session expired or invalid token." });
  }
};

module.exports = { protect };