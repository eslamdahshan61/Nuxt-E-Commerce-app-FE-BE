import { PrismaClient } from '@prisma/client';

export async function seedCategories(prisma: PrismaClient) {
  const electronics = await prisma.category.upsert({
    where: { name: 'Electronics' },
    update: {},
    create: {
      name: 'Electronics',
      parentId: null,
    },
  });

  const clothing = await prisma.category.upsert({
    where: { name: 'Clothing' },
    update: {},
    create: {
      name: 'Clothing',
      parentId: null,
    },
  });

  const home = await prisma.category.upsert({
    where: { name: 'Home & Kitchen' },
    update: {},
    create: {
      name: 'Home & Kitchen',
      parentId: null,
    },
  });

  const smartphones = await prisma.category.upsert({
    where: { name: 'Smartphones' },
    update: {},
    create: {
      name: 'Smartphones',
      parentId: electronics.id,
    },
  });

  const laptops = await prisma.category.upsert({
    where: { name: 'Laptops' },
    update: {},
    create: {
      name: 'Laptops',
      parentId: electronics.id,
    },
  });

  const mensClothing = await prisma.category.upsert({
    where: { name: "Men's Clothing" },
    update: {},
    create: {
      name: "Men's Clothing",
      parentId: clothing.id,
    },
  });

  const womensClothing = await prisma.category.upsert({
    where: { name: "Women's Clothing" },
    update: {},
    create: {
      name: "Women's Clothing",
      parentId: clothing.id,
    },
  });

  return {
    electronics,
    clothing,
    home,
    smartphones,
    laptops,
    mensClothing,
    womensClothing,
  };
}
