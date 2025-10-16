import type { H3Event } from "h3";
import { createCategorySchema } from '../../schemas/validation.schemas';
import { handleSafeError } from '../../utils/safeError';

export default defineEventHandler(async (event: H3Event) => {
    try {
    await getUserFromToken(event);

    const body = await readBody(event);
    const validatedData = await validateBody(createCategorySchema, body);

    const { name, parentId } = validatedData;

    const existing = await prisma?.category.findUnique({
        where: { name },
    });

    if (existing) {
        throw createError({
            statusCode: 409,
            statusMessage: "Category with this name already exists",
        });
    }

    if (parentId) {
        const parentCategory = await prisma?.category.findUnique({
            where: { id: parentId },
        });

        if (!parentCategory) {
            throw createError({
                statusCode: 404,
                statusMessage: "Parent category not found",
            });
        }
    }

    const category = await prisma?.category.create({
        data: {
            name,
            parentId: parentId || null,
        },
        include: {
            parent: true,
            children: true,
        },
    });

    await deleteCachePattern("categories:page:*");
    await deleteCachePattern("category:*");

    await emitCategoryCreated({
        categoryId: category.id,
        parentId: category.parentId,
    });

    return category;
    } catch (error) {
        handleSafeError(error, 'Failed to create category');
    }
});
