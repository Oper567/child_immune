const express = require('express');
const router = express.Router();
const { prisma } = require("@immunize/database");
const { protect } = require('../middleware/auth'); // Import your JWT protector
/**
 * ðŸ‡³ðŸ‡¬ Nigeria EPI Schedule Definition
 * 'days' represents the number of days after birth the vaccine is due.
 */
const VACCINE_SCHEDULE = [
  { name: 'BCG', days: 0 }, { name: 'OPV-0', days: 0 }, { name: 'HepB-0', days: 0 },
  { name: 'PENTA-1', days: 42 }, { name: 'OPV-1', days: 42 }, { name: 'PCV-1', days: 42 },
  { name: 'Rota-1', days: 42 }, { name: 'PENTA-2', days: 70 }, { name: 'OPV-2', days: 70 },
  { name: 'PENTA-3', days: 98 }, { name: 'Measles-1', days: 270 }, { name: 'Yellow Fever', days: 270 }
];

// 1. GET DASHBOARD STATS (Total registered vs. pending today)
router.get('/stats', protect, async (req, res) => {
  try {
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const end = new Date(); end.setHours(23, 59, 59, 999);

    const [totalChildren, pendingToday] = await Promise.all([
      prisma.child.count(),
      prisma.record.count({
        where: { status: 'DUE', nextDueDate: { gte: start, lte: end } }
      })
    ]);
    
    res.json({ totalChildren, pendingToday });
  } catch (error) {
    res.status(500).json({ error: "Could not load stats" });
  }
});

// 2. SEARCH FOR CHILD (Phone or UHID)
router.get('/search', protect, async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(400).json({ error: "Search query required" });

    const results = await prisma.child.findMany({
      where: {
        OR: [
          { guardianPhone: { contains: query } },
          { uhid: { contains: query, mode: 'insensitive' } }
        ]
      },
      take: 10
    });
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: "Search failed" });
  }
});

// 3. REGISTER CHILD (Includes auto-generating schedule)
router.post('/register', protect, async (req, res) => {
  const { firstName, lastName, dob, guardianPhone } = req.body;
  const workerId = req.user?.id; // Assuming JWT payload has worker ID

  if (!firstName || !lastName || !dob || !guardianPhone) {
    return res.status(400).json({ error: "Please provide all required fields." });
  }

  try {
    const birthDate = new Date(dob);
    // Unique ID format: IMU-2026-ABC12
    const uhid = `IMU-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    const newChild = await prisma.child.create({
      data: {
        uhid,
        firstName,
        lastName,
        dob: birthDate,
        guardianPhone,
        // Optional: Link to the health worker who performed the registration
        ...(workerId && { workerId: workerId }),
        records: {
          create: VACCINE_SCHEDULE.map(v => ({
            vaccineName: v.name,
            status: 'DUE',
            nextDueDate: new Date(birthDate.getTime() + v.days * 24 * 60 * 60 * 1000),
            clinicName: req.user?.clinicName || "Obiaruku Central Clinic"
          }))
        }
      },
      include: { records: true } // Return the child WITH their schedule
    });

    res.status(201).json(newChild);
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ error: "Registration failed", details: error.message });
  }
});

module.exports = router;

