const { PrismaClient } = require('@prisma/client');

// Use global prisma to prevent connection exhaustion on Render
const prisma = global.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

const getHealthMetrics = async (req, res) => {
  try {
    // 1. Aggregate Vaccine Status
    const vaccineStats = await prisma.record.groupBy({
      by: ['status', 'vaccineName'],
      _count: { id: true },
    });

    // 2. Identify 'Missed' hotspots by clinic
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

// This MUST be named exactly as you destructure it in index.js
module.exports = { getHealthMetrics };