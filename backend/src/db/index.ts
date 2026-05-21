import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

/** Connect to PostgreSQL (via direct URL or Prisma Accelerate, depending on DATABASE_URL). */
export async function initDb(): Promise<void> {
  await prisma.$connect();
  if (process.env.NODE_ENV !== 'production') {
    console.log('✅ Database connected (Prisma)');
  }
}

export default prisma;
