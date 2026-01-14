const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const { hashPassword, generateToken } = require("./utils/auth.js");
const { protect } = require("./middleware/auth.js");
const { registerChild } = require("./controllers/childController");
const { searchChild } = require("./controllers/searchController");

let prisma;
if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient({ log: ["error", "warn"] });
} else {
  if (!global.prisma) global.prisma = new PrismaClient();
  prisma = global.prisma;
}

const app = express();
app.use(cors({ origin: "*", methods: ["GET", "POST", "PATCH", "DELETE"], credentials: true }));
app.use(express.json());

// ✅ HEALTH CHECK
app.get("/", (req, res) => res.status(200).json({ status: "Online", node: "ObiTrack Obiaruku" }));

// --- 🔐 AUTH ROUTES ---

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

// --- 🏥 CLINIC DATA ROUTES ---

app.post("/api/register", protect, registerChild);
app.get("/api/search", protect, searchChild);

// GET MEDICAL CARD (Child + History)
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

// UPDATE VACCINE (With Worker Assignment)
app.post("/api/records/update-vaccine", protect, async (req, res) => {
  const { childId, vaccineName, dateGiven } = req.body;
  const workerId = req.user.id; // From 'protect' middleware

  try {
    // We use updateMany to target the specific 'DUE' record for that vaccine
    const updated = await prisma.record.updateMany({
      where: { 
        childId: childId, 
        vaccineName: vaccineName, 
        status: "DUE" 
      },
      data: { 
        status: "COMPLETED", 
        administeredAt: new Date(dateGiven),
        workerId: workerId,
        clinicName: "Obiaruku Central Clinic"
      }
    });

    if (updated.count === 0) return res.status(404).json({ error: "No pending dose found" });
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: "Update failed" });
  }
});

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
    res.status(500).json({ error: "Stats failed" });
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Critical Server Error" });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, "0.0.0.0", () => console.log(`🚀 ObiTrack Live on ${PORT}`));