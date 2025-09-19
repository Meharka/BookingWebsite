import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis; // Use globalThis to avoid multiple instances in development

const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export { prisma };

