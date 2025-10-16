import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  const client = new PrismaClient({
    log: [
      {
        emit: 'event',
        level: 'query',
      },
      {
        emit: 'event',
        level: 'error',
      },
      {
        emit: 'event',
        level: 'warn',
      },
    ],
  });

  client.$on('query', (e: any) => {
    if (e.duration > 100) {
      console.warn('low query detected:', {
        query: e.query.substring(0, 200) + (e.query.length > 200 ? '...' : ''),
        duration: `${e.duration}ms`,
        timestamp: new Date().toISOString(),
      });
    }
  });

  client.$on('error', (e: any) => {
    console.error('Prisma Error:', {
      message: e.message,
      timestamp: new Date().toISOString(),
    });
  });

  client.$on('warn', (e: any) => {
    console.warn('Prisma Warning:', {
      message: e.message,
      timestamp: new Date().toISOString(),
    });
  });

  return client;
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}
