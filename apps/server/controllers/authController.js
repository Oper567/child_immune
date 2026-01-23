const { prisma } = require("../../../packages/database");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Helper: create token
function signToken(worker) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is missing in env");

  return jwt.sign(
    { id: worker.id, role: worker.role || "worker" },
    secret,
    { expiresIn: "7d" }
  );
}

// 1) Register a New Health Worker
const registerWorker = async (req, res) => {
  try {
    const { name, email, password, clinicName, workerId } = req.body;

    if (!name || !email || !password || !clinicName || !workerId) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedWorkerId = workerId.trim().toUpperCase();

    // Worker ID format check (edit if your format differs)
    if (!/^OB-2024-\d{4}$/.test(normalizedWorkerId)) {
      return res.status(400).json({ error: "Invalid Worker ID. Use OB-2024-1234" });
    }

    // Check duplicates
    const existing = await prisma.healthWorker.findFirst({
      where: {
        OR: [
          { email: normalizedEmail },
          { workerId: normalizedWorkerId }
        ]
      }
    });

    if (existing) {
      return res.status(409).json({ error: "Email or Worker ID already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const worker = await prisma.healthWorker.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        clinicName: clinicName.trim(),
        workerId: normalizedWorkerId,
        role: "worker" // or "admin" if you want special accounts
      },
      select: {
        id: true,
        name: true,
        email: true,
        clinicName: true,
        role: true
      }
    });

    const token = signToken(worker);

    return res.status(201).json({
      token,
      name: worker.name,
      clinicName: worker.clinicName,
      role: worker.role,
      workerId: worker.id
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Registration failed" });
  }
};

// 2) Login Worker
const loginWorker = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const worker = await prisma.healthWorker.findUnique({
      where: { email: normalizedEmail },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        clinicName: true,
        role: true
      }
    });

    if (!worker) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(password, worker.password);
    if (!ok) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = signToken(worker);

    return res.json({
      token,
      name: worker.name,
      clinicName: worker.clinicName,
      role: worker.role || "worker",
      workerId: worker.id
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Login failed" });
  }
};

module.exports = { registerWorker, loginWorker };
