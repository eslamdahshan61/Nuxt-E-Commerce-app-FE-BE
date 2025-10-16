import { enrichCategoryWithProductCount } from '../../utils/category';

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Category ID is required',
    });
  }

  const categoryId = Number(id);

  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    include: {
      parent: true,
      children: true,
      products: {
        take: 10,
        select: {
          id: true,
          name: true,
          price: true,
        },
      },
      _count: {
        select: { products: true },
      },
    },
  });

  if (!category) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Category not found',
    });
  }

  const enrichedCategory = await enrichCategoryWithProductCount(category);

  return enrichedCategory;
});
