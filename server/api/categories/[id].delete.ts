import type { H3Event } from "h3";

export default defineEventHandler(async (event: H3Event) => {
    await getUserFromToken(event);

    const id = getRouterParam(event, "id");

    if (!id) {
        throw createError({
            statusCode: 400,
            statusMessage: "Category ID is required",
        });
    }

    const categoryId = Number(id);

    const existing = await prisma.category.findUnique({
        where: { id: categoryId },
        include: {
            _count: {
                select: {
                    products: true,
                    children: true,
                },
            },
        },
    });

    if (!existing) {
        throw createError({
            statusCode: 404,
            statusMessage: "Category not found",
        });
    }

    if (existing._count.children > 0) {
        throw createError({
            statusCode: 400,
            statusMessage: "Cannot delete category with subcategories",
        });
    }

    if (existing._count.products > 0) {
        throw createError({
            statusCode: 400,
            statusMessage: "Cannot delete category with products",
        });
    }

    await prisma.category.delete({
        where: { id: categoryId },
    });

    await deleteCachePattern("categories:page:*");
    await deleteCachePattern("category:*");

    await emitCategoryDeleted({
        categoryId: existing.id,
        parentId: existing.parentId,
    });

    return {
        message: "Category deleted successfully",
    };
});
