import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Create PrismaClient with Accelerate extension for production
// Use regular PrismaClient for local development with direct connection
const prismaClientSingleton = () => {
  const client = new PrismaClient();
  
  // Only use Accelerate in production or when explicitly using Accelerate URL
  if (process.env.DATABASE_URL?.startsWith('prisma+postgres://')) {
    return client.$extends(withAccelerate()) as unknown as PrismaClient;
  }
  
  return client;
};

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;