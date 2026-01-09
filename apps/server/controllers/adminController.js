export const getHealthMetrics = async (req, res) => {
  try {
    const metrics = await prisma.record.groupBy({
      by: ['status', 'vaccineName'],
      _count: { _all: true },
    });

    // Identifying 'Missed' hotspots by clinic
    const hotspots = await prisma.clinic.findMany({
      include: {
        _count: {
          select: { records: { where: { status: 'MISSED' } } }
        }
      },
      orderBy: { records: { _count: 'desc' } },
      take: 5
    });

    res.json({ metrics, hotspots });
  } catch (error) {
    res.status(500).json({ error: "Could not fetch metrics" });
  }
};