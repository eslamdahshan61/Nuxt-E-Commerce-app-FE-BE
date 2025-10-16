import type { H3Event } from "h3";
import { updateProductSchema, productIdSchema } from '../../schemas/validation.schemas';
import { handleSafeError } from '../../utils/safeError';

export default defineEventHandler(async (event: H3Event) => {
    try {
    await getUserFromToken(event);

    const id = getRouterParam(event, "id");
    
    const { id: productId } = await validateParams(productIdSchema, { id });
    const numericProductId = Number(productId);

    const body = await readBody(event);
    const validatedData = await validateBody(updateProductSchema, body);

    const existing = await prisma?.product.findUnique({
        where: { id: numericProductId },
    });

    if (!existing) {
        throw createError({
            statusCode: 404,
            statusMessage: "Product not found",
        });
    }

    const { name, description, price, categoryId, stock, imageUrl } = validatedData;

    if (categoryId) {
        const category = await prisma?.category.findUnique({
            where: { id: categoryId },
        });

        if (!category) {
            throw createError({
                statusCode: 404,
                statusMessage: "Category not found",
            });
        }
    }

    const product = await prisma?.product.update({
        where: { id: numericProductId },
        data: {
            ...(name && { name }),
            ...(description && { description }),
            ...(price && { price }),
            ...(categoryId && { categoryId }),
            ...(stock !== undefined && { stock }),
            ...(imageUrl !== undefined && { imageUrl }),
        },
        include: {
            category: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
    });

    await deleteCachePattern("categories:page:*");
    await deleteCachePattern("category:*");
    await deleteCachePattern("products:page:*");

    await emitProductUpdated({
        productId: product.id,
        oldCategoryId: existing.categoryId,
        newCategoryId: product.categoryId,
    });

    return product;
    } catch (error) {
        handleSafeError(error, 'Failed to update product');
    }
});
