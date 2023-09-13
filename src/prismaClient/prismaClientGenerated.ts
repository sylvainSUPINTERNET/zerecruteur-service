import { PrismaClient } from '@prisma/client';

// opti : https://www.prisma.io/blog/improving-query-performance-using-indexes-2-MyoiJNMFTsfq
// TODO add indexes
export const prisma = new PrismaClient(
    {
        log: ['query', 'info', 'warn', 'error']
    }
);
