import { PrismaClient } from '@prisma/client';
import { seedUsers } from './seeders/user.seeder';
import { seedCategories } from './seeders/category.seeder';
import { seedProducts } from './seeders/product.seeder';

const prisma = new PrismaClient();

async function main() {
  await seedUsers(prisma);
  const categories = await seedCategories(prisma);
  await seedProducts(prisma, categories);
}

main()
  .catch((e) => {
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
