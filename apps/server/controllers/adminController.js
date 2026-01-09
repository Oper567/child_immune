const { PrismaClient } = require('@prisma/client');

/** * 1. FIX: In monorepos, Prisma Client might need a specific path. 
 * If this fails, we use the standard way.
 */
let prisma;
if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}

/**
 * Health Metrics Logic
 */
const getHealthMetrics = async (req, res) => {
  try {
    // Check if prisma is connected
    await prisma.$connect();

    // 1. Aggregate Vaccine Status
    // NOTE: Ensure your schema has a model named 'record' (lowercase) or 'Record'
    const vaccineStats = await prisma.record.groupBy({
      by: ['status', 'vaccineName'],
      _count: { id: true },
    });

    // 2. Identify 'Missed' hotspots by clinic
    const hotspots = await prisma.record.groupBy({
      by: ['clinicName'],
      where: { status: 'MISSED' },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 5
    });

    // 3. Overall Coverage Rate Calculation
    const totalRecords = await prisma.record.count();
    const completedRecords = await prisma.record.count({ 
      where: { status: 'COMPLETED' } 
    });
    
    const coverageRate = totalRecords > 0 ? (completedRecords / totalRecords) * 100 : 0;

    return res.status(200).json({ 
      vaccineStats, 
      hotspots, 
      overallCoverage: coverageRate.toFixed(2) + "%"
    });
    
  } catch (error) {
    /** * 2. LOGGING: This is crucial for Render logs. 
     * If there's a 500 error, this will tell us WHY (e.g., 'Record model not found').
     */
    console.error("CRITICAL METRICS ERROR:", error.message);
    return res.status(500).json({ 
      error: "Internal Server Error", 
      details: error.message 
    });
  }
};

// Ensure these names match your imports in index.js exactly
module.exports = { getHealthMetrics };