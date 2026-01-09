const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs'); // You may need to run: npm install bcryptjs

// 1. Register a New Health Worker
const registerWorker = async (req, res) => {
    try {
        const { name, email, password, clinicName, clinicCode } = req.body;
        
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const worker = await prisma.healthWorker.create({
            data: {
                name,
                email,
                password: hashedPassword,
                clinicName,
                clinicCode
            }
        });

        res.status(201).json({ message: "Worker registered", workerId: worker.id });
    } catch (error) {
        res.status(400).json({ error: "Email already exists or invalid data" });
    }
};

// 2. Login (To get the workerId for future records)
const loginWorker = async (req, res) => {
    const { email, password } = req.body;
    const worker = await prisma.healthWorker.findUnique({ where: { email } });

    if (worker && await bcrypt.compare(password, worker.password)) {
        res.json({ message: "Login successful", workerId: worker.id, clinicName: worker.clinicName });
    } else {
        res.status(401).json({ error: "Invalid credentials" });
    }
};

module.exports = { registerWorker, loginWorker };