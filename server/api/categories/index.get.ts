import { enrichCategoriesWithProductCount } from '../../utils/category';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const parentId = query.parentId ? Number(query.parentId) : undefined;
  
  const skip = (page - 1) * limit;

  const cacheKey = `categories:page:${page}:limit:${limit}:parent:${parentId || 'null'}`;
  const cached = await getCache(cacheKey);
  
  if (cached) {
    return cached;
  }

  const where = parentId ? { parentId } : {};

  const [categories, total] = await Promise.all([
    prisma?.category.findMany({
      where,
      skip,
      take: limit,
      include: {
        parent: {
          select: {
            id: true,
            name: true,
          },
        },
        children: {
          select: {
            id: true,
            name: true,
          },
          take: 10,
        },
        _count: {
          select: { products: true },
        },
      },
      orderBy: { name: 'asc' },
    }),
    prisma?.category.count({ where }),
  ]);

  const enrichedCategories = await enrichCategoriesWithProductCount(categories || []);

  const result = {
    data: enrichedCategories,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };

  await setCache(cacheKey, result, 300);

  return result;
});
