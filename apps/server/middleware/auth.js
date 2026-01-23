const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  try {
    const authHeader =
      req.headers.authorization ||
      req.headers.Authorization ||
      "";

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Access denied. Please log in." });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Access denied. Missing token." });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is missing in env");
      return res.status(500).json({ error: "Server misconfiguration (JWT secret missing)." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // decoded should contain: { id, role, clinicName?, workerId? }
    req.worker = {
      id: decoded.id,
      role: decoded.role || "worker",
      clinicName: decoded.clinicName,
      workerId: decoded.workerId,
    };

    return next();
  } catch (err) {
    console.error("🔒 Auth Error:", err.message);

    // Nice error messages
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Session expired. Please log in again." });
    }

    return res.status(401).json({ error: "Invalid token. Please log in again." });
  }
};

// Optional: role-based access control
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.worker) {
      return res.status(401).json({ error: "Access denied. Please log in." });
    }
    if (!roles.includes(req.worker.role)) {
      return res.status(403).json({ error: "Forbidden: insufficient permissions." });
    }
    next();
  };
};

module.exports = { protect, requireRole };
