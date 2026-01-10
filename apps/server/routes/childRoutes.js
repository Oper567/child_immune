const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Nigeria EPI Schedule
const VACCINE_SCHEDULE = [
  { name: 'BCG', days: 0 }, { name: 'OPV-0', days: 0 }, { name: 'HepB-0', days: 0 },
  { name: 'PENTA-1', days: 42 }, { name: 'OPV-1', days: 42 }, { name: 'PCV-1', days: 42 },
  { name: 'Rota-1', days: 42 }, { name: 'PENTA-2', days: 70 }, { name: 'OPV-2', days: 70 },
  { name: 'PENTA-3', days: 98 }, { name: 'Measles-1', days: 270 }, { name: 'Yellow Fever', days: 270 }
];

// 1. GET DASHBOARD STATS
router.get('/stats', async (req, res) => {
  try {
    const totalChildren = await prisma.child.count();
    const pendingVaccines = await prisma.record.count({ where: { status: 'DUE' } });
    
    res.json({ totalChildren, pendingVaccines });
  } catch (error) {
    console.error("Stats Error:", error);
    res.status(500).json({ error: "Could not load stats" });
  }
});

// 2. SEARCH FOR CHILD (Phone or UHID)
router.get('/search', async (req, res) => {
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
      take: 5
    });
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: "Search failed" });
  }
});

// 3. REGISTER CHILD
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, dob, guardianPhone } = req.body;
    const workerId = req.worker?.id; // From your JWT middleware

    if (!firstName || !lastName || !dob || !guardianPhone) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const birthDate = new Date(dob);
    const uhid = `IMU-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    const newChild = await prisma.child.create({
      data: {
        uhid,
        firstName,
        lastName,
        dob: birthDate,
        guardianPhone,
        // Only link worker if ID is a valid MongoDB ObjectId (24 chars)
        ...(workerId && workerId.length === 24 ? {
          registeredBy: { connect: { id: workerId } }
        } : {}),
        records: {
          create: VACCINE_SCHEDULE.map(v => ({
            vaccineName: v.name,
            status: 'DUE',
            nextDueDate: new Date(birthDate.getTime() + v.days * 24 * 60 * 60 * 1000),
            clinicName: req.worker?.clinicName || "Asaba General Hospital"
          }))
        }
      }
    });

    res.status(201).json(newChild);
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ error: "Registration failed", details: error.message });
  }
});

module.exports = router;