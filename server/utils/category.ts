import type { H3Event } from 'h3';

export async function getDescendantCategoryIds(categoryId: number): Promise<number[]> {
  const descendants: number[] = [categoryId];
  
  const children = await prisma.category.findMany({
    where: { parentId: categoryId },
    select: { id: true },
  });

  for (const child of children) {
    const childDescendants = await getDescendantCategoryIds(child.id);
    descendants.push(...childDescendants);
  }

  return descendants;
}

export async function getRecursiveProductCount(categoryId: number): Promise<number> {
  const categoryIds = await getDescendantCategoryIds(categoryId);
  
  const count = await prisma.product.count({
    where: {
      categoryId: {
        in: categoryIds,
      },
      deletedAt: null,
    },
  });

  return count;
}

export async function enrichCategoryWithProductCount(category: any) {
  const productCount = await getRecursiveProductCount(category.id);
  return {
    ...category,
    recursiveProductCount: productCount,
  };
}

export async function enrichCategoriesWithProductCount(categories: any[]) {
  return Promise.all(
    categories.map(category => enrichCategoryWithProductCount(category))
  );
}
