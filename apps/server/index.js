const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");

const prisma = require("../../packages/database");

const { hashPassword, generateToken } = require("./utils/auth");
const { protect } = require("./middleware/auth");

const { registerChild } = require("./controllers/childController");
const { searchChild } = require("./controllers/searchController");

const app = express();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({ status: "Online", service: "child-immune-api" });
});

/**
 * WORKER AUTH
 */
app.post("/api/worker/register", async (req, res) => {
  try {
    const { name, email, password, clinicName } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "name, email, password required" });
    }

    const worker = await prisma.healthWorker.create({
      data: {
        name,
        email: email.toLowerCase().trim(),
        password: await hashPassword(password),
        clinicName: clinicName || "Asaba General Hospital",
        role: "WORKER",
      },
    });

    return res.status(201).json({ message: "Account Created", id: worker.id });
  } catch (e) {
    console.error("Register error:", e);
    return res.status(400).json({ error: "Registration failed. Email may exist." });
  }
});

app.post("/api/worker/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "email and password required" });

    const worker = await prisma.healthWorker.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!worker) return res.status(404).json({ error: "Worker not found" });

    const ok = await bcrypt.compare(password, worker.password);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const token = generateToken(worker);

    return res.json({
      token,
      worker: { id: worker.id, name: worker.name, clinicName: worker.clinicName, role: worker.role },
    });
  } catch (e) {
    console.error("Login error:", e);
    return res.status(500).json({ error: "Login failed" });
  }
});

/**
 * PROTECTED ROUTES
 */
app.post("/api/register", protect, registerChild);
app.get("/api/search", protect, searchChild);

app.get("/api/due-today", protect, async (req, res) => {
  try {
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const end = new Date(); end.setHours(23, 59, 59, 999);

    const dueRecords = await prisma.record.findMany({
      where: { status: "DUE", nextDueDate: { gte: start, lte: end } },
      include: { child: true },
      orderBy: { nextDueDate: "asc" },
    });

    res.json(dueRecords);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Queue fetch failed" });
  }
});

app.get("/api/stats", protect, async (req, res) => {
  try {
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const end = new Date(); end.setHours(23, 59, 59, 999);

    const [totalChildren, vaccinesDueToday, totalAdministered] = await Promise.all([
      prisma.child.count(),
      prisma.record.count({ where: { status: "DUE", nextDueDate: { gte: start, lte: end } } }),
      prisma.record.count({ where: { status: "COMPLETED" } }),
    ]);

    res.json({ totalChildren, vaccinesDueToday, totalAdministered });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Stats fetch failed" });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, "0.0.0.0", () => console.log(`🚀 child-immune-api live on ${PORT}`));
