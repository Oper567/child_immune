const prisma = require("../../../packages/database");

const VACCINE_SCHEDULE = [
  { name: "BCG", days: 0 },
  { name: "OPV-0", days: 0 },
  { name: "HepB-0", days: 0 },
  { name: "PENTA-1", days: 42 },
  { name: "OPV-1", days: 42 },
  { name: "PCV-1", days: 42 },
  { name: "Rota-1", days: 42 },
  { name: "PENTA-2", days: 70 },
  { name: "OPV-2", days: 70 },
  { name: "PENTA-3", days: 98 },
  { name: "Measles-1", days: 270 },
  { name: "Yellow Fever", days: 270 },
];

const registerChild = async (req, res) => {
  try {
    const { firstName, lastName, dob, guardianPhone } = req.body;

    const workerId = req.worker?.id;
    const clinicName = req.worker?.clinicName || "Asaba General Hospital";

    if (!firstName || !lastName || !dob || !guardianPhone) {
      return res.status(400).json({ error: "Missing required medical data" });
    }

    const birthDate = new Date(dob);
    if (isNaN(birthDate.getTime())) {
      return res.status(400).json({ error: "Invalid Date of Birth" });
    }

    const currentYear = new Date().getFullYear();
    const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
    const uhid = `IMU-${currentYear}-${randomStr}`;

    const newChild = await prisma.child.create({
      data: {
        uhid,
        firstName,
        lastName,
        dateOfBirth: birthDate, // ✅ Prisma expects dateOfBirth
        guardianPhone,
        ...(workerId && { registeredBy: { connect: { id: workerId } } }),
        records: {
          create: VACCINE_SCHEDULE.map((v) => ({
            vaccineName: v.name,
            status: "DUE",
            nextDueDate: new Date(birthDate.getTime() + v.days * 24 * 60 * 60 * 1000),
            clinicName,
          })),
        },
      },
      include: {
        records: { orderBy: { nextDueDate: "asc" } },
      },
    });

    return res.status(201).json(newChild);
  } catch (error) {
    console.error("❌ DB Error:", error);
    return res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
};

module.exports = { registerChild };
