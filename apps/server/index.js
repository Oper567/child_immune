const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

// Utilities & Middleware
const { hashPassword, generateToken } = require('./utils/auth.js');
const { protect } = require('./middleware/auth.js'); 

// Controllers (Ensure these paths are correct in your folder structure)
const { registerChild } = require('./controllers/childController');
const { searchChild } = require('./controllers/searchController');

// ✅ Prisma Singleton (Prevents MongoDB connection exhaustion)
let prisma;
if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient({ log: ['error', 'warn'] });
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}

const app = express();

// ✅ CORS optimized for Obiaruku Node
app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  credentials: true
}));
app.use(express.json());

// ✅ Root Health Check (Branded)
app.get('/', (req, res) => {
  res.status(200).json({ 
    status: 'Online', 
    node: 'ObiTrack Obiaruku Central',
    message: 'Obiaruku Health Services Active',
    timestamp: new Date().toISOString()
  });
});

// --- 🔐 WORKER AUTH ROUTES ---

app.post('/api/worker/register', async (req, res) => {
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
        email: email.toLowerCase(),
        password: hashedPassword,
        clinicName: "Obiaruku Central Clinic",
        clinicCode
      }
    });

    res.status(201).json({ message: "ObiTrack Account Created", id: worker.id });
  } catch (error) {
    res.status(400).json({ error: "Email already registered in Obiaruku Node." });
  }
});

app.post('/api/worker/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const worker = await prisma.healthWorker.findUnique({ where: { email: email.toLowerCase() } });
    if (!worker) return res.status(404).json({ error: "Worker not found in Obiaruku database" });

    const validPass = await bcrypt.compare(password, worker.password);
    if (!validPass) return res.status(401).json({ error: "Invalid credentials" });

    const token = generateToken(worker);
    res.json({ token, worker: { id: worker.id, name: worker.name, clinicName: worker.clinicName } });
  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
});

// --- 🏥 PROTECTED CLINIC ROUTES ---

app.post('/api/register', protect, registerChild);
app.get('/api/search', protect, searchChild);

// ✅ Daily Queue: Fetches children due for vaccines TODAY
app.get('/api/due-today', protect, async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const dueRecords = await prisma.record.findMany({
      where: {
        status: 'DUE',
        nextDueDate: { gte: startOfDay, lte: endOfDay }
      },
      include: { child: true }, // Pulls child details for the table
      orderBy: { child: { lastName: 'asc' } }
    });
    res.json(dueRecords);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch daily queue" });
  }
});

// ✅ Dashboard Stats (Fixed for your Frontend)
app.get('/api/stats', protect, async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const [totalChildren, vaccinesDueToday, totalAdministered] = await Promise.all([
      prisma.child.count(),
      prisma.record.count({
        where: { status: 'DUE', nextDueDate: { gte: startOfDay, lte: endOfDay } }
      }),
      prisma.record.count({ where: { status: 'COMPLETED' } })
    ]);

    res.json({ totalChildren, vaccinesDueToday, totalAdministered });
  } catch (error) {
    res.status(500).json({ error: "Database sync failed" });
  }
});

// ✅ Administer Vaccine
app.patch('/api/record/:id', protect, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const updated = await prisma.record.update({
      where: { id },
      data: { 
        status, 
        administeredAt: status === 'COMPLETED' ? new Date() : null,
        clinicName: "Obiaruku Central Clinic" 
      }
    });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: "Failed to update record" });
  }
});

// --- ⚠️ ERROR HANDLING ---
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Critical Node Error' });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 ObiTrack: Obiaruku Node Live on Port ${PORT}`);
});