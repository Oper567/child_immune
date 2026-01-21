const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("database");
const bcrypt = require("bcryptjs");

// Utilities & Middleware
const { hashPassword, generateToken } = require("./utils/auth.js");
const { protect } = require("./middleware/auth.js");

// Controllers
const { registerChild } = require("./controllers/childController");
const { searchChild } = require("./controllers/searchController");

// Prisma Setup
let prisma;
if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient({ log: ["error", "warn"] });
} else {
  if (!global.prisma) global.prisma = new PrismaClient();
  prisma = global.prisma;
}

const app = express();

// --- ðŸ› ï¸ MIDDLEWARE ---
// Critical: Added more specific CORS to allow Authorization headers
app.use(cors({ 
  origin: "*", 
  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"], 
  allowedHeaders: ["Content-Type", "Authorization"] 
}));
app.use(express.json());

// ROOT HEALTH CHECK
app.get("/", (req, res) => {
  res.status(200).json({ status: "Online", node: "ObiTrack Obiaruku Node" });
});

// --- ðŸ” WORKER AUTH ROUTES ---

app.post("/api/worker/register", async (req, res) => {
  const { name, email, password, clinicCode } = req.body;
  const MASTER_CODE = process.env.MASTER_CLINIC_CODE || "OBI-2026";

  try {
    if (clinicCode !== MASTER_CODE) return res.status(401).json({ error: "Invalid Access Code" });
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
    res.status(400).json({ error: "Registration failed. Email may exist." });
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

// --- ðŸ¥ CLINIC DATA ROUTES ---

app.post("/api/register", protect, registerChild);
app.get("/api/search", protect, searchChild);

// DASHBOARD QUEUE: Children due for vaccines today
app.get("/api/due-today", protect, async (req, res) => {
  try {
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const end = new Date(); end.setHours(23, 59, 59, 999);

    const dueRecords = await prisma.record.findMany({
      where: { 
        status: "DUE", 
        nextDueDate: { gte: start, lte: end } 
      },
      include: { child: true },
      orderBy: { child: { lastName: "asc" } },
    });
    res.json(dueRecords);
  } catch (error) {
    res.status(500).json({ error: "Queue fetch failed" });
  }
});

// GET MEDICAL CARD (History)
app.get("/api/records/:id", protect, async (req, res) => {
  const { id } = req.params;
  if (!id || id === "undefined" || id === "null") {
    return res.status(400).json({ error: "A valid Patient ID is required" });
  }
  try {
    const child = await prisma.child.findUnique({
      where: { id },
      include: { records: { orderBy: { nextDueDate: 'asc' } } }
    });
    if (!child) return res.status(404).json({ error: "Child not found" });
    res.json(child);
  } catch (error) {
    res.status(500).json({ error: "Database fetch failed" });
  }
});

// UPDATE VACCINE (Administer dose)
app.post("/api/records/update-vaccine", protect, async (req, res) => {
  const { childId, vaccineName, dateGiven } = req.body;
  const workerId = req.user.id;

  try {
    // Attempt to update the 'DUE' record to 'COMPLETED'
    const updated = await prisma.record.updateMany({
      where: { childId, vaccineName, status: "DUE" },
      data: { 
        status: "COMPLETED", 
        administeredAt: new Date(dateGiven),
        workerId,
        clinicName: "Obiaruku Central Clinic"
      }
    });

    // Fallback: If no 'DUE' record exists, create a new 'COMPLETED' entry
    if (updated.count === 0) {
        await prisma.record.create({
            data: {
                childId,
                vaccineName,
                status: "COMPLETED",
                administeredAt: new Date(dateGiven),
                workerId,
                clinicName: "Obiaruku Central Clinic",
                nextDueDate: new Date() // Placeholder
            }
        });
    }
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: "Vaccination update failed" });
  }
});

// DASHBOARD SUMMARY STATS
app.get("/api/stats", protect, async (req, res) => {
  try {
    const start = new Date(); start.setHours(0,0,0,0);
    const end = new Date(); end.setHours(23,59,59,999);

    const [totalChildren, vaccinesDueToday, totalAdministered] = await Promise.all([
      prisma.child.count(),
      prisma.record.count({ where: { status: "DUE", nextDueDate: { gte: start, lte: end } } }),
      prisma.record.count({ where: { status: "COMPLETED" } }),
    ]);

    res.json({ totalChildren, vaccinesDueToday, totalAdministered });
  } catch (error) {
    res.status(500).json({ error: "Stats fetch failed" });
  }
});

// âœ… ADDED: ANALYTICS METRICS ROUTE
app.get("/api/metrics", protect, async (req, res) => {
  try {
    const vaccineStats = await prisma.record.groupBy({
      by: ['vaccineName', 'status'],
      _count: { id: true },
    });

    const totalChildren = await prisma.child.count();
    const completedDoses = await prisma.record.count({ where: { status: "COMPLETED" } });
    
    // Simple calculation for coverage rate
    const overallCoverage = totalChildren > 0 
      ? `${Math.round((completedDoses / (totalChildren * 5)) * 100)}%` 
      : "0%";

    res.json({
      overallCoverage,
      totalCompleted: completedDoses,
      vaccineStats,
      hotspots: [] // Placeholder for future spatial analysis
    });
  } catch (error) {
    res.status(500).json({ error: "Metrics synchronization failed" });
  }
});

// Error Handling
app.use((err, req, res, next) => {
  console.error("ðŸ’¥ SERVER ERROR:", err.stack);
  res.status(500).json({ error: "Critical Server Error" });
});


const PORT = process.env.PORT || 10000;
app.listen(PORT, "0.0.0.0", () => console.log("🚀 child-immune-api live on "));


