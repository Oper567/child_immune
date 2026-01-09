// Go up one level to reach the 'generated' folder from 'controllers'
const { PrismaClient } = require('../generated/client');
const prisma = new PrismaClient();

// Standard Expanded Schedule
const VACCINE_SCHEDULE = [
  { name: 'BCG', days: 0 },
  { name: 'OPV-0', days: 0 },
  { name: 'PENTA-1', days: 42 },
  { name: 'OPV-1', days: 42 },
  { name: 'PENTA-2', days: 70 },
  { name: 'PENTA-3', days: 98 },
  { name: 'Measles-1', days: 270 },
];

const registerChild = async (req, res) => {
  const { firstName, lastName, dob, guardianPhone } = req.body;

  if (!firstName || !lastName || !dob || !guardianPhone) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const birthDate = new Date(dob);
  // Unique ID: IMU-2026-ABC12
  const uhid = `IMU-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

  try {
    const newChild = await prisma.child.create({
      data: {
        uhid,
        firstName,
        lastName,
        dob: birthDate,
        guardianPhone,
        records: {
          create: VACCINE_SCHEDULE.map(v => ({
            vaccineName: v.name,
            status: 'DUE',
            nextDueDate: new Date(birthDate.getTime() + v.days * 24 * 60 * 60 * 1000)
          }))
        }
      },
      include: { records: true }
    });

    return res.status(201).json(newChild);
  } catch (error) {
    console.error("Creation Error:", error);
    return res.status(500).json({ error: "Failed to save to cloud database" });
  }
};

module.exports = { registerChild };