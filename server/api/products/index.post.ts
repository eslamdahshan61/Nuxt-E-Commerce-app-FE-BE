import type { H3Event } from "h3";
import { createProductSchema } from '../../schemas/validation.schemas';
import { handleSafeError } from '../../utils/safeError';

export default defineEventHandler(async (event: H3Event) => {
    try {
        await getUserFromToken(event);

        const body = await readBody(event);
        const validatedData = await validateBody(createProductSchema, body);

        const { name, description, price, categoryId, stock, imageUrl } = validatedData;

        const category = await prisma?.category.findUnique({
            where: { id: categoryId },
        });

        if (!category) {
            throw createError({
                statusCode: 404,
                statusMessage: "Category not found",
            });
        }

        const product = await prisma?.product.create({
            data: {
                name,
                description,
                price,
                categoryId,
                ...(stock !== undefined && { stock }),
                ...(imageUrl && { imageUrl }),
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

    await emitProductCreated({
        productId: product.id,
        categoryId: product.categoryId,
    });

    return product;
    } catch (error) {
        handleSafeError(error, 'Failed to create product');
    }
});
