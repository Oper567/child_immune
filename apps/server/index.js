const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Utilities & Middleware
const { hashPassword, generateToken } = require('./utils/auth.js');
const { protect } = require('./middleware/auth.js'); 

// Controllers
const { registerChild } = require('./controllers/childController');
const { searchChild } = require('./controllers/searchController');
const { getHealthMetrics } = require('./controllers/metricsController');

// ✅ Prisma Singleton
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
const JWT_SECRET = process.env.JWT_SECRET || 'asaba_medical_secret_2026';
const MASTER_CLINIC_CODE = "HEALTH-2026";

app.use(cors());
app.use(express.json());

// ✅ Root Health Check
app.get('/', (req, res) => {
  res.status(200).json({ 
    status: 'Online', 
    message: 'ImmuniTrack Asaba Node Active',
    timestamp: new Date().toISOString()
  });
});

// --- WORKER AUTH ROUTES ---

// 1. Register Health Worker
app.post('/api/worker/register', async (req, res) => {
  const { name, email, password, clinicCode, clinicName } = req.body;
  try {
    if (clinicCode !== MASTER_CLINIC_CODE) {
      return res.status(401).json({ error: "Invalid Clinic Access Code" });
    }

    const hashedPassword = await hashPassword(password);
    const worker = await prisma.healthWorker.create({
      data: {
        name,
        email,
        password: hashedPassword,
        clinicName: clinicName || "General Hospital Asaba",
        clinicCode
      }
    });

    res.status(201).json({ message: "Account created successfully" });
  } catch (error) {
    res.status(400).json({ error: "Registration failed. Email might already exist." });
  }
});

// 2. Worker Login
app.post('/api/worker/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const worker = await prisma.healthWorker.findUnique({ where: { email } });
    if (!worker) return res.status(404).json({ error: "Worker not found" });

    const validPass = await bcrypt.compare(password, worker.password);
    if (!validPass) return res.status(401).json({ error: "Invalid password" });

    const token = generateToken(worker);

    res.json({ token, name: worker.name, clinicName: worker.clinicName });
  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
});

// --- PROTECTED MEDICAL ROUTES ---

// Registration & Search
app.post('/api/register', protect, registerChild);
app.get('/api/search', protect, searchChild);

// Child Profile & Records
app.get('/api/child/:uhid', protect, async (req, res) => {
  const { uhid } = req.params;
  try {
    const child = await prisma.child.findUnique({
      where: { uhid: uhid.toUpperCase() },
      include: { records: { orderBy: { nextDueDate: 'asc' } } }
    });
    
    if (!child) return res.status(404).json({ error: "Record not found" });
    res.json(child);
  } catch (error) {
    res.status(500).json({ error: "Fetch failed" });
  }
});

// Vaccine Administration
app.patch('/api/record/:id', protect, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const updated = await prisma.record.update({
      where: { id },
      data: { 
        status, 
        administeredAt: status === 'COMPLETED' ? new Date() : null,
        workerId: req.worker.id,
        clinicName: req.worker.clinicName // Auto-stamp clinic from worker profile
      }
    });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: "Update failed" });
  }
});

// Analytics & Stats
app.get('/api/stats', protect, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const [totalChildren, vaccinesDueToday, totalAdministered] = await Promise.all([
      prisma.child.count(),
      prisma.record.count({
        where: { status: 'DUE', nextDueDate: { gte: today, lt: tomorrow } }
      }),
      prisma.record.count({ where: { status: 'COMPLETED' } })
    ]);

    res.json({ totalChildren, vaccinesDueToday, totalAdministered });
  } catch (error) {
    res.status(500).json({ error: "Stats load failed" });
  }
});

app.get('/api/metrics', protect, getHealthMetrics);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Asaba Node Live on Port ${PORT}`);
});

module.exports = app;