export const searchChild = async (req, res) => {
  const { query } = req.query; // e.g., ?query=IMU-2026-X

  try {
    const results = await prisma.child.findMany({
      where: {
        OR: [
          { uhid: { equals: query.toUpperCase() } },
          { guardianPhone: { contains: query } }
        ]
      },
      select: {
        id: true,
        uhid: true,
        firstName: true,
        lastName: true,
        dob: true
      }
    });

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: "Search failed" });
  }
};