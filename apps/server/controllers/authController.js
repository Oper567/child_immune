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

    // Validate required fields
    if (!name || !email || !password || !clinicName || !workerId) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedWorkerId = workerId.trim().toUpperCase();
    const cleanName = name.trim();
    const cleanClinicName = clinicName.trim();

    // Worker ID format check (adjust if your format differs)
    if (!/^OB-2024-\d{4}$/.test(normalizedWorkerId)) {
      return res.status(400).json({ error: "Invalid Worker ID. Use OB-2024-1234" });
    }

    // Check duplicates
    const existing = await prisma.healthWorker.findFirst({
      where: {
        OR: [{ email: normalizedEmail }, { workerId: normalizedWorkerId }],
      },
      select: { id: true },
    });

    if (existing) {
      return res.status(409).json({ error: "Email or Worker ID already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const worker = await prisma.healthWorker.create({
      data: {
        name: cleanName,
        email: normalizedEmail,
        password: hashedPassword,
        clinicName: cleanClinicName,
        workerId: normalizedWorkerId,
        role: "worker", // keep string if your schema role is String, use "WORKER" if enum
      },
      select: {
        id: true,
        name: true,
        clinicName: true,
        role: true,
        workerId: true,
      },
    });

    const token = signToken(worker);

    return res.status(201).json({
      token,
      name: worker.name,
      clinicName: worker.clinicName,
      role: worker.role || "worker",

      // ✅ both identifiers
      workerDbId: worker.id,        // Mongo _id
      workerId: worker.workerId,    // staff code e.g OB-2024-1234
    });
  } catch (error) {
    console.error(error);

    // Prisma unique constraint (Mongo)
    if (error.code === "P2002") {
      return res.status(409).json({ error: "Email or Worker ID already exists" });
    }

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
        password: true,
        clinicName: true,
        role: true,
        workerId: true, // ✅ include staff code
      },
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

      // ✅ both identifiers
      workerDbId: worker.id,
      workerId: worker.workerId,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Login failed" });
  }
};

module.exports = { registerWorker, loginWorker };
