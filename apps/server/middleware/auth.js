const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  try {
    const auth = req.headers.authorization || "";
    if (!auth.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Access denied. Please log in." });
    }

    const token = auth.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // decoded contains { id, role, clinicName }
    req.worker = decoded;

    next();
  } catch (err) {
    console.error("🔒 Auth Error:", err.message);
    return res.status(401).json({ error: "Session expired or invalid token." });
  }
};

module.exports = { protect };
