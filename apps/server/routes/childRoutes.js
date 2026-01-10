router.get('/due-today', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dueCount = await prisma.record.count({
      where: {
        nextDueDate: { gte: today, lt: tomorrow },
        status: 'DUE'
      }
    });
    res.json({ count: dueCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});