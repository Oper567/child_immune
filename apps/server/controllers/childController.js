const { PrismaClient } = require('@prisma/client');

// ✅ Singleton pattern for Prisma to prevent exhausting DB connections
if (!global.prisma) {
  global.prisma = new PrismaClient();
}
const prisma = global.prisma;

// Nigeria EPI Schedule (Days from birth)
const VACCINE_SCHEDULE = [
  { name: 'BCG', days: 0 },
  { name: 'OPV-0', days: 0 },
  { name: 'HepB-0', days: 0 },
  { name: 'PENTA-1', days: 42 },
  { name: 'OPV-1', days: 42 },
  { name: 'PCV-1', days: 42 },
  { name: 'Rota-1', days: 42 },
  { name: 'PENTA-2', days: 70 },
  { name: 'OPV-2', days: 70 },
  { name: 'PENTA-3', days: 98 },
  { name: 'Measles-1', days: 270 },
  { name: 'Yellow Fever', days: 270 },
];

const registerChild = async (req, res) => {
  try {
    const { firstName, lastName, dob, guardianPhone } = req.body;
    
    // 1. Context Extraction (from JWT middleware)
    const workerId = req.worker?.id;
    const clinicName = req.worker?.clinicName || "Asaba General Hospital";

    // 2. Strict Input Validation
    if (!firstName || !lastName || !dob || !guardianPhone) {
      return res.status(400).json({ error: "All fields are required to create a health record." });
    }

    // Ensure date is valid (prevents "Invalid Date" database crash)
    const birthDate = new Date(dob);
    if (isNaN(birthDate.getTime())) {
      return res.status(400).json({ error: "Invalid Date of Birth provided." });
    }

    // 3. Unique UHID Generation
    const currentYear = new Date().getFullYear();
    const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
    const uhid = `IMU-${currentYear}-${randomStr}`;

    // 4. Atomic Transaction: Creating Child and nested Vaccination Schedule
    // 
    const newChild = await prisma.child.create({
      data: {
        uhid,
        firstName,
        lastName,
        dob: birthDate,
        guardianPhone,
        records: {
          create: VACCINE_SCHEDULE.map(v => {
            // Calculate precise date: birthDate + (days * ms in a day)
            const dueDate = new Date(birthDate.getTime() + v.days * 24 * 60 * 60 * 1000);
            return {
              vaccineName: v.name,
              status: 'DUE',
              nextDueDate: dueDate,
              clinicName: clinicName,
            };
          })
        }
      },
      include: { 
        records: { 
          orderBy: { nextDueDate: 'asc' } 
        } 
      }
    });

    console.log(`🏥 [REGISTERED] ${uhid} at ${clinicName} by Worker ${workerId || 'SYSTEM'}`);
    return res.status(201).json(newChild);

  } catch (error) {
    console.error("❌ Registration Error:", error);

    // Specific Handling for Prisma Errors
    if (error.code === 'P2002') {
      return res.status(400).json({ 
        error: "Duplicate Entry", 
        details: "A child with this phone number or UHID already exists." 
      });
    }

    // Check if database is down/unreachable
    if (error.message.includes('Can\'t reach database server')) {
      return res.status(503).json({ 
        error: "Database Offline", 
        details: "The Health Cloud is temporarily unreachable. Please try again." 
      });
    }

    return res.status(500).json({ 
      error: "Internal Server Error", 
      details: error.message 
    });
  }
};

module.exports = { registerChild };