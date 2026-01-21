const { PrismaClient } = require('@prisma/client');

/**
 * 1. Singleton pattern: 
 * Reuses the existing Prisma instance if it exists on the global object.
 * This prevents the "Too many connections" error in MongoDB during development.
 */
const prisma = global.prisma || new PrismaClient();

/**
 * 2. Save to global object in development:
 * This ensures that Hot Module Replacement (HMR) doesn't create new 
 * connections every time you save a file.
 */
if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

/**
 * 3. Export for CommonJS:
 * This allows your server to use: const prisma = require('../../packages/database');
 */
module.exports = prisma;