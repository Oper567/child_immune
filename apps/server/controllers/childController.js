const { PrismaClient } = require('@prisma/client');

// ✅ Singleton pattern for Prisma
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
  const { firstName, lastName, dob, guardianPhone } = req.body;
  
  // Get Worker info from the JWT (provided by our middleware)
  const workerId = req.worker?.id;
  const clinicName = req.worker?.clinic || "Asaba General Hospital";

  // 1. Validation
  if (!firstName || !lastName || !dob || !guardianPhone) {
    return res.status(400).json({ error: "Missing required medical data" });
  }

  const birthDate = new Date(dob);
  
  // 2. UHID Generation (e.g., IMU-2026-X8R2A)
  const currentYear = new Date().getFullYear();
  const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
  const uhid = `IMU-${currentYear}-${randomStr}`;

  try {
    // 3. ATOMIC TRANSACTION: Create Child + All Records at once
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
            // Math: Birthdate + (days * ms in a day)
            nextDueDate: new Date(birthDate.getTime() + v.days * 24 * 60 * 60 * 1000),
            clinicName: clinicName,
          }))
        }
      },
      include: { 
        records: { 
          orderBy: { nextDueDate: 'asc' } 
        } 
      }
    });

    // 4. LOGGING (Optional: For monitoring clinic activity)
    console.log(`🏥 [REGISTERED] ${uhid} at ${clinicName} by Worker ${workerId}`);

    return res.status(201).json(newChild);

  } catch (error) {
    console.error("❌ Registration Error:", error);
    return res.status(500).json({ 
      error: "Cloud sync failed. Check database connection.", 
      details: error.message 
    });
  }
};

module.exports = { registerChild };