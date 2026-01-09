const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

export const searchChild = async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ error: "Search query is required" });
  }

  try {
    const results = await prisma.child.findMany({
      where: {
        OR: [
          // 1. Partial match for UHID (case insensitive)
          { uhid: { contains: query.toUpperCase() } },
          
          // 2. Partial match for Phone Number
          { guardianPhone: { contains: query } },
          
          // 3. Search by Surname (Useful if the parent forgot the ID)
          { lastName: { contains: query, mode: 'insensitive' } }
        ]
      },
      select: {
        id: true,
        uhid: true,
        firstName: true,
        lastName: true,
        dob: true,
        guardianPhone: true // Added to help verify the correct child
      },
      take: 15 // Limit results to prevent UI lag on mobile
    });

    res.json(results);
  } catch (error) {
    console.error("Search Error:", error);
    res.status(500).json({ error: "Registry search failed" });
  }
};
module.exports = { searchChild };