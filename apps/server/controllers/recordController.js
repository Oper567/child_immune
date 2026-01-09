const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const administerVaccine = async (req, res) => {
  const { recordId } = req.params;
  const { clinicName } = req.body;

  try {
    const updatedRecord = await prisma.record.update({
      where: { id: recordId },
      data: {
        status: 'COMPLETED',
        administeredAt: new Date(),
        // We get workerId and clinic from req.worker (set by our middleware!)
        workerId: req.worker.id,
        clinicName: clinicName || req.worker.clinicName || "General Hospital Asaba"
      }
    });

    res.json({ 
      message: "Vaccine administered successfully", 
      record: updatedRecord 
    });
  } catch (error) {
    console.error("Administer Error:", error);
    res.status(400).json({ error: "Failed to update vaccine record" });
  }
};

module.exports = { administerVaccine };