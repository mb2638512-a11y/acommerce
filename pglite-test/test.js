const { PGlite } = require('@electric-sql/pglite');
const { PrismaPgLite } = require('pglite-prisma-adapter');
const { PrismaClient } = require('@prisma/client');

async function main() {
  console.log('Initializing PGLite...');
  const connectionString = 'postgresql://postgres:postgres@localhost:5432/postgres'; // dummy
  const client = new PGlite();
  const adapter = new PrismaPgLite(client);
  const prisma = new PrismaClient({ adapter });

  console.log('Testing PGLite query...');
  try {
    const result = await prisma.$queryRaw`SELECT 1 as result`;
    console.log('Query successful:', result);
  } catch (e) {
    console.error('Query failed:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
