import type { H3Event } from 'h3';
import { updateCategorySchema, categoryIdSchema } from '../../schemas/validation.schemas.ts';
import { handleSafeError } from '../../utils/safeError';
export default defineEventHandler(async (event: H3Event) => {
  const startTime = Date.now();
  
  try {
  const user = await getUserFromToken(event);
  

  const id = getRouterParam(event, 'id');
  
  const { id: categoryId } = await validateParams(categoryIdSchema, { id });
  const numericId = Number(categoryId);
  
  const body = await readBody(event);
  const validatedData = await validateBody(updateCategorySchema, body);
  const { name, parentId } = validatedData;
  
  const existing = await prisma?.category.findUnique({
    where: { id: numericId },
  });

  if (!existing) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Category not found',
    });
  }
    if (parentId) {
        const existingNewParent = await prisma?.category.findUnique({
            where: { id: parentId },
        });
      if (!existingNewParent) {
        throw createError({
          statusCode: 404,
          statusMessage: 'New parent category not found',
        });
      }
    }


  if (name && name !== existing.name) {
    const duplicate = await prisma?.category.findUnique({
      where: { name },
    });

    if (duplicate) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Category with this name already exists',
      });
    }
  }

  const category = await prisma?.category.update({
    where: { id: numericId },
    data: {
      ...(name && { name }),
      ...(parentId !== undefined && { parentId }),
    },
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
        take: 20,
      },
      _count: {
        select: {
          products: true,
        },
      },
    },
  });
  

  await deleteCachePattern('categories:page:*');
  await deleteCachePattern('category:*');

  await emitCategoryUpdated({
    categoryId: category!.id,
    oldParentId: existing.parentId,
    newParentId: category!.parentId,
  });

  const duration = Date.now() - startTime;

  return category;
  } catch (error: any) {
    const duration = Date.now() - startTime;
    handleSafeError(error, 'Failed to update category');
  }
});
