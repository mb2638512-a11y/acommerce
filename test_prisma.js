const { PrismaClient } = require('./backend/node_modules/@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Testing Prisma connection...');
  try {
    const user = await prisma.user.findFirst();
    console.log("DB connection successful. Found user:", user ? user.email : "none (table empty)");
  } catch (e) {
    console.error("DB Error:", e.name, e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
