const express = require('express');
const cors = require('cors');
// Safe import for Monorepo Prisma 6/7
const { PrismaClient } = require('./generated/client');
const prisma = new PrismaClient();

const { registerChild } = require('./controllers/childController');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Root Health Check
app.get('/', (req, res) => {
  res.status(200).json({ status: 'Online', message: 'Immunize-Chain API' });
});

// --- ROUTES ---

// 1. Register a new child and generate schedule
app.post('/api/register', registerChild);

// 2. Search for a child by UHID (Case-Insensitive)
app.get('/api/child/:uhid', async (req, res) => {
  const { uhid } = req.params;
  try {
    const child = await prisma.child.findUnique({
      where: { uhid: uhid.toUpperCase() },
      include: { 
        records: { 
          orderBy: { nextDueDate: 'asc' } 
        } 
      }
    });
    
    if (!child) return res.status(404).json({ error: "Child record not found" });
    res.json(child);
  } catch (error) {
    console.error("Fetch Error:", error);
    res.status(500).json({ error: "Database connection failed" });
  }
});

// 3. Mark a vaccine as administered
app.patch('/api/record/:id', async (req, res) => {
  const { id } = req.params;
  const { status, clinicName } = req.body; // clinicName is optional extra data

  try {
    const updatedRecord = await prisma.record.update({
      where: { id: id },
      data: { 
        status: status, // Expected: 'COMPLETED' or 'MISSED'
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
// Get Dashboard Statistics
app.get('/api/stats', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const totalChildren = await prisma.child.count();
    
    const vaccinesDueToday = await prisma.record.count({
      where: {
        status: 'DUE',
        nextDueDate: {
          gte: today,
          lt: tomorrow
        }
      }
    });

    const totalAdministered = await prisma.record.count({
      where: { status: 'COMPLETED' }
    });

    res.json({
      totalChildren,
      vaccinesDueToday,
      totalAdministered
    });
  } catch (error) {
    res.status(500).json({ error: "Could not fetch stats" });
  }
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});
// Only start the listener if running locally
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
