const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getHealthMetrics = async (req, res) => {
  try {
    // 1. Aggregate Vaccine Status (e.g., how many BCG are COMPLETED vs MISSED)
    const vaccineStats = await prisma.record.groupBy({
      by: ['status', 'vaccineName'],
      _count: { id: true },
    });

    // 2. Identify 'Missed' hotspots by clinic
    // We group records by clinicName and count the MISSED ones
    const hotspots = await prisma.record.groupBy({
      by: ['clinicName'],
      where: {
        status: 'MISSED'
      },
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 5
    });

    // 3. Overall Coverage Rate Calculation
    const totalRecords = await prisma.record.count();
    const completedRecords = await prisma.record.count({ where: { status: 'COMPLETED' } });
    
    // Simple math for the dashboard: (Completed / Total) * 100
    const coverageRate = totalRecords > 0 ? (completedRecords / totalRecords) * 100 : 0;

    res.json({ 
      vaccineStats, 
      hotspots, 
      overallCoverage: coverageRate.toFixed(2) + "%"
    });
    
  } catch (error) {
    console.error("Metrics Error:", error);
    res.status(500).json({ error: "Could not fetch health metrics" });
  }
};
