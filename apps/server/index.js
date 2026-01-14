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

// 🕵️ DEBUG MIDDLEWARE: Prints malformed data to Render logs
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
      return res.status(401).json({ error: "Invalid Access Code" });
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
    res.status(201).json({ message: "Account Created", id: worker.id });
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

// GET INDIVIDUAL RECORD (Fixes the 404 for details view)
app.get("/api/records/:id", protect, async (req, res) => {
  const { id } = req.params;
  if (!id || id === "undefined") return res.status(400).json({ error: "Valid ID required" });

  try {
    const record = await prisma.record.findUnique({
      where: { id },
      include: { child: true }
    });
    if (!record) return res.status(404).json({ error: "Record not found" });
    res.json(record);
  } catch (error) {
    res.status(500).json({ error: "Error fetching record" });
  }
});

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

// --- ✅ UPDATE ROUTES ---

// Update by ID (The standard way)
app.patch("/api/records/:id", protect, async (req, res) => {
  const { id } = req.params;
  if (!id || id === "undefined") return res.status(400).json({ error: "Valid ID required" });

  try {
    const updated = await prisma.record.update({
      where: { id },
      data: { status: "COMPLETED", administeredAt: new Date() }
    });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: "Update failed" });
  }
});

// Bulk/Named Update
app.post("/api/records/update-vaccine", protect, async (req, res) => {
  const { childId, vaccineName } = req.body;
  try {
    const updated = await prisma.record.updateMany({
      where: { childId, vaccineName, status: "DUE" },
      data: { status: "COMPLETED", administeredAt: new Date() }
    });
    res.json({ success: true, updated });
  } catch (error) {
    res.status(400).json({ error: "Update failed" });
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