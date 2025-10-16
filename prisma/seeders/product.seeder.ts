import { PrismaClient } from '@prisma/client';

interface CategoryMap {
  smartphones: { id: number };
  laptops: { id: number };
  mensClothing: { id: number };
  womensClothing: { id: number };
  home: { id: number };
}

export async function seedProducts(
  prisma: PrismaClient,
  categories: CategoryMap,
) {
  const products = await Promise.all([
    prisma.product.upsert({
      where: { id: 1 },
      update: {},
      create: {
        name: 'iPhone 15 Pro',
        description:
          'Latest Apple iPhone with A17 Pro chip, titanium design, and advanced camera system',
        price: 999.99,
        categoryId: categories.smartphones.id,
      },
    }),
    prisma.product.upsert({
      where: { id: 2 },
      update: {},
      create: {
        name: 'Samsung Galaxy S24 Ultra',
        description:
          'Premium Android smartphone with S Pen, 200MP camera, and AI features',
        price: 1199.99,
        categoryId: categories.smartphones.id,
      },
    }),
    prisma.product.upsert({
      where: { id: 3 },
      update: {},
      create: {
        name: 'MacBook Pro 14"',
        description:
          'Powerful laptop with M3 chip, stunning display, and all-day battery life',
        price: 1999.99,
        categoryId: categories.laptops.id,
      },
    }),
    prisma.product.upsert({
      where: { id: 4 },
      update: {},
      create: {
        name: 'Dell XPS 15',
        description:
          'High-performance Windows laptop with Intel i9 processor and NVIDIA graphics',
        price: 1799.99,
        categoryId: categories.laptops.id,
      },
    }),
    prisma.product.upsert({
      where: { id: 5 },
      update: {},
      create: {
        name: "Men's Cotton T-Shirt",
        description:
          'Comfortable and breathable cotton t-shirt in various colors',
        price: 24.99,
        categoryId: categories.mensClothing.id,
      },
    }),
    prisma.product.upsert({
      where: { id: 6 },
      update: {},
      create: {
        name: "Men's Denim Jeans",
        description:
          'Classic fit denim jeans with stretch fabric for comfort',
        price: 59.99,
        categoryId: categories.mensClothing.id,
      },
    }),
    prisma.product.upsert({
      where: { id: 7 },
      update: {},
      create: {
        name: "Women's Summer Dress",
        description:
          'Lightweight and elegant summer dress perfect for any occasion',
        price: 79.99,
        categoryId: categories.womensClothing.id,
      },
    }),
    prisma.product.upsert({
      where: { id: 8 },
      update: {},
      create: {
        name: "Women's Yoga Pants",
        description:
          'High-waisted, moisture-wicking yoga pants for active lifestyle',
        price: 44.99,
        categoryId: categories.womensClothing.id,
      },
    }),
    prisma.product.upsert({
      where: { id: 9 },
      update: {},
      create: {
        name: 'Coffee Maker',
        description:
          'Programmable coffee maker with thermal carafe and auto-brew feature',
        price: 89.99,
        categoryId: categories.home.id,
      },
    }),
    prisma.product.upsert({
      where: { id: 10 },
      update: {},
      create: {
        name: 'Blender Set',
        description:
          'Professional blender with multiple speeds and various attachments',
        price: 129.99,
        categoryId: categories.home.id,
      },
    }),
  ]);

  return products;
}
