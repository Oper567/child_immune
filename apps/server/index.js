const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

// ✅ FIX: Improved Singleton for Prisma
// This prevents "Too many connections" errors on MongoDB Atlas during Vercel cold starts
let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient({
    log: ['error', 'warn'],
  });
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}

// Ensure this path is 100% correct relative to index.js
const { registerChild } = require('./controllers/childController');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ✅ Root Health Check 
// If this returns JSON, your Vercel setup is 100% correct.
app.get('/', (req, res) => {
  res.status(200).json({ 
    status: 'Online', 
    message: 'Immunize-Chain API',
    timestamp: new Date().toISOString()
  });
});

// --- ROUTES ---

app.post('/api/register', registerChild);

app.get('/api/child/:uhid', async (req, res) => {
  const { uhid } = req.params;
  try {
    const child = await prisma.child.findUnique({
      where: { uhid: uhid.toUpperCase() },
      include: { 
        records: { orderBy: { nextDueDate: 'asc' } } 
      }
    });
    
    if (!child) return res.status(404).json({ error: "Child record not found" });
    res.json(child);
  } catch (error) {
    console.error("Fetch Error:", error);
    res.status(500).json({ error: "Database query failed", message: error.message });
  }
});

app.patch('/api/record/:id', async (req, res) => {
  const { id } = req.params;
  const { status, clinicName } = req.body;
  try {
    const updatedRecord = await prisma.record.update({
      where: { id: id },
      data: { 
        status: status, 
        administeredAt: status === 'COMPLETED' ? new Date() : null,
        clinicName: clinicName || "General Clinic"
      }
    });
    res.json(updatedRecord);
  } catch (error) {
    console.error("Update Error:", error);
    res.status(400).json({ error: "Failed to update record" });
  }
});

app.get('/api/stats', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const [totalChildren, vaccinesDueToday, totalAdministered] = await Promise.all([
      prisma.child.count(),
      prisma.record.count({
        where: {
          status: 'DUE',
          nextDueDate: { gte: today, lt: tomorrow }
        }
      }),
      prisma.record.count({ where: { status: 'COMPLETED' } })
    ]);

    res.json({ totalChildren, vaccinesDueToday, totalAdministered });
  } catch (error) {
    console.error("Stats Error:", error);
    res.status(500).json({ error: "Could not fetch stats" });
  }
});

// Global Error Handler for Vercel Logs
app.use((err, req, res, next) => {
  console.error("CRITICAL ERROR:", err.message);
  res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

// Local Development Listener
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => {
    console.log(`🚀 Local Server: http://localhost:${PORT}`);
  });
}

// ✅ EXPORT FOR VERCEL
module.exports = app;