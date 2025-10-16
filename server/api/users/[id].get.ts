import type { H3Event } from "h3";

export default defineEventHandler(async (event: H3Event) => {
    await getUserFromToken(event);

    const id = getRouterParam(event, "id");

    if (!id) {
        throw createError({
            statusCode: 400,
            statusMessage: "User ID is required",
        });
    }

    const userId = Number(id);

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            username: true,
            email: true,
            createdAt: true,
            updatedAt: true,
        },
    });

    if (!user) {
        throw createError({
            statusCode: 404,
            statusMessage: "User not found",
        });
    }

    return user;
});
