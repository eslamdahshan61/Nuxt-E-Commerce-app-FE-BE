import { handleSafeError } from '../../utils/safeError';
import { getDescendantCategoryIds } from '../../utils/category';

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const categoryId = query.categoryId ? Number(query.categoryId) : undefined;
    const search = query.search ? String(query.search) : undefined;
    const minPrice = query.minPrice ? Number(query.minPrice) : undefined;
    const maxPrice = query.maxPrice ? Number(query.maxPrice) : undefined;
  
  const skip = (page - 1) * limit;

  const where: any = {
    deletedAt: null,
  };
  
  if (categoryId) {
    const categoryIds = await getDescendantCategoryIds(categoryId);
    where.categoryId = {
      in: categoryIds,
    };
  }
  
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { description: { contains: search } },
    ];
  }
  
  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price.gte = minPrice;
    if (maxPrice) where.price.lte = maxPrice;
  }

  const [products, total] = await Promise.all([
    prisma?.product.findMany({
      where,
      skip,
      take: limit,
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        stock: true,
        imageUrl: true,
        categoryId: true,
        createdAt: true,
        updatedAt: true,
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma?.product.count({ where }),
  ]);

  return {
    data: products,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil((total || 0) / limit),
    },
  };
  } catch (error) {
    handleSafeError(error, 'Failed to fetch products');
  }
});
