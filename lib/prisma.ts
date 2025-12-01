import { PrismaClient } from '@prisma/client';

const candidateUrl =
  process.env.DATABASE_URL ||
  process.env.news_db_POSTGRES_PRISMA_URL ||
  process.env.news_db_POSTGRES_URL ||
  process.env.news_db_POSTGRES_URL_NON_POOLING;

if (!process.env.DATABASE_URL && candidateUrl) {
  process.env.DATABASE_URL = candidateUrl;
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
