const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

// Utilities & Middleware
const { hashPassword, generateToken } = require("./utils/auth.js");
const { protect } = require("./middleware/auth.js");

// Controllers
const { registerChild } = require("./controllers/childController");
const { searchChild } = require("./controllers/searchController");

let prisma;
if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient({ log: ["error", "warn"] });
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}

const app = express();

app.use(cors({ origin: "*", methods: ["GET", "POST", "PATCH", "DELETE"], credentials: true }));
app.use(express.json());

// 🕵️ DEBUG MIDDLEWARE: Watch this in Render logs to catch "jwt malformed"
app.use((req, res, next) => {
  const auth = req.headers.authorization;
  if (auth && (auth.includes("undefined") || auth.includes("null"))) {
    console.error("🚨 MALFORMED TOKEN DETECTED:", auth);
  }
  next();
});

// ✅ ROOT HEALTH CHECK
app.get("/", (req, res) => {
  res.status(200).json({ status: "Online", node: "ObiTrack Obiaruku Central" });
});

// --- 🔐 WORKER AUTH ROUTES ---

app.post("/api/worker/register", async (req, res) => {
  const { name, email, password, clinicCode } = req.body;
  const MASTER_CLINIC_CODE = process.env.MASTER_CLINIC_CODE || "OBI-2026";

  try {
    if (clinicCode !== MASTER_CLINIC_CODE) {
      return res.status(401).json({ error: "Invalid Obiaruku Access Code" });
    }
    const hashedPassword = await hashPassword(password);
    const worker = await prisma.healthWorker.create({
      data: {
        name,
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        clinicName: "Obiaruku Central Clinic",
        clinicCode,
      },
    });
    res.status(201).json({ message: "ObiTrack Account Created", id: worker.id });
  } catch (error) {
    res.status(400).json({ error: "Email already registered." });
  }
});

app.post("/api/worker/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const worker = await prisma.healthWorker.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
    if (!worker) return res.status(404).json({ error: "Worker not found" });

    const validPass = await bcrypt.compare(password, worker.password);
    if (!validPass) return res.status(401).json({ error: "Invalid credentials" });

    const token = generateToken(worker);
    res.json({ token, worker: { id: worker.id, name: worker.name, clinicName: worker.clinicName } });
  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
});

// --- 🏥 CLINIC DATA ROUTES ---

app.post("/api/register", protect, registerChild);
app.get("/api/search", protect, searchChild);

app.get("/api/due-today", protect, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tonight = new Date();
    tonight.setHours(23, 59, 59, 999);

    const dueRecords = await prisma.record.findMany({
      where: { status: "DUE", nextDueDate: { gte: today, lte: tonight } },
      include: { child: true },
      orderBy: { child: { lastName: "asc" } },
    });
    res.json(dueRecords);
  } catch (error) {
    res.status(500).json({ error: "Queue fetch failed" });
  }
});

app.get("/api/stats", protect, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [totalChildren, vaccinesDueToday, totalAdministered] = await Promise.all([
      prisma.child.count(),
      prisma.record.count({ where: { status: "DUE", nextDueDate: { gte: today, lte: new Date().setHours(23,59,59,999) } } }),
      prisma.record.count({ where: { status: "COMPLETED" } }),
    ]);
    res.json({ totalChildren, vaccinesDueToday, totalAdministered });
  } catch (error) {
    res.status(500).json({ error: "Stats failed" });
  }
});

app.get("/api/metrics", protect, async (req, res) => {
  try {
    const vaccineStats = await prisma.record.groupBy({ by: ['vaccineName', 'status'], _count: { id: true } });
    const totalRecords = await prisma.record.count();
    const completed = await prisma.record.count({ where: { status: "COMPLETED" } });
    const coverage = totalRecords > 0 ? Math.round((completed / totalRecords) * 100) : 0;

    const hotspots = await prisma.record.groupBy({
      by: ['clinicName'],
      where: { status: "DUE", nextDueDate: { lt: new Date() } },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 5
    });

    res.json({ overallCoverage: `${coverage}%`, vaccineStats, hotspots });
  } catch (error) {
    res.status(500).json({ error: "Metrics failed" });
  }
});

// --- ✅ FIXING THE 404: RECORD UPDATE ROUTES ---

// Option A: Update by Child and Vaccine Name
app.post("/api/records/update-vaccine", protect, async (req, res) => {
  const { childId, vaccineName } = req.body;
  try {
    const updated = await prisma.record.updateMany({
      where: { childId, vaccineName, status: "DUE" },
      data: { status: "COMPLETED", administeredAt: new Date(), clinicName: "Obiaruku Central Clinic" }
    });
    res.json({ success: true, updated });
  } catch (error) {
    res.status(400).json({ error: "Update failed" });
  }
});

// Option B: Update by specific Record ID (To fix your "undefined" 404)
app.patch("/api/record/:id", protect, async (req, res) => {
  const { id } = req.params;
  if (!id || id === "undefined") return res.status(400).json({ error: "Valid ID required" });

  try {
    const updated = await prisma.record.update({
      where: { id },
      data: { status: "COMPLETED", administeredAt: new Date(), clinicName: "Obiaruku Central Clinic" }
    });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: "Record not found" });
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Critical Node Error" });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 ObiTrack Node Live: Port ${PORT}`);
});