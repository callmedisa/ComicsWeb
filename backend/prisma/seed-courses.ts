import { PrismaClient } from "@prisma/client";
import { syncCourseCatalog } from "../src/courses/catalog";

const prisma = new PrismaClient();

// The server also runs this sync on startup; the script is kept for seeding a
// database without starting the server.
async function main() {
  const count = await syncCourseCatalog(prisma);
  console.log(`Seeded ${count} courses with lessons.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
