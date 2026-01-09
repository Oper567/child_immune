const { PrismaClient } = require('@prisma/client');

// ✅ Singleton pattern: Reuse the existing connection if it exists
// This prevents the "Application exited early" error caused by connection exhaustion
if (!global.prisma) {
  global.prisma = new PrismaClient();
}
const prisma = global.prisma;

// Standard Expanded Schedule (Days from birth)
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

  // 1. Validation
  if (!firstName || !lastName || !dob || !guardianPhone) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const birthDate = new Date(dob);
  
  // 2. Unique ID Generation (e.g., IMU-2026-ABC12)
  const currentYear = new Date().getFullYear();
  const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
  const uhid = `IMU-${currentYear}-${randomStr}`;

  try {
    // 3. Create Child and associated Vaccine Records in one transaction
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
            // Calculation: Birthdate + (days * milliseconds in a day)
            nextDueDate: new Date(birthDate.getTime() + v.days * 24 * 60 * 60 * 1000)
          }))
        }
      },
      include: { 
        records: { 
          orderBy: { nextDueDate: 'asc' } 
        } 
      }
    });

    console.log(`✅ Success: Child ${uhid} registered.`);
    return res.status(201).json(newChild);

  } catch (error) {
    console.error("❌ Database Creation Error:", error);
    return res.status(500).json({ 
      error: "Failed to save to cloud database", 
      details: error.message 
    });
  }
};

module.exports = { registerChild };