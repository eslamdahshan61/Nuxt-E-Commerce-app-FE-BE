import type { H3Event } from "h3";

export default defineEventHandler(async (event: H3Event) => {
    await getUserFromToken(event);

    const id = getRouterParam(event, "id");

    if (!id) {
        throw createError({
            statusCode: 400,
            statusMessage: "Product ID is required",
        });
    }

    const productId = Number(id);

    const existing = await prisma.product.findUnique({
        where: { id: productId },
    });

    if (!existing) {
        throw createError({
            statusCode: 404,
            statusMessage: "Product not found",
        });
    }

    await prisma.product.delete({
        where: { id: productId },
    });

    await deleteCachePattern("categories:page:*");
    await deleteCachePattern("category:*");
    await deleteCachePattern("products:page:*");

    await emitProductDeleted({
        productId: existing.id,
        categoryId: existing.categoryId,
    });

    return {
        message: "Product deleted successfully",
    };
});
