import type { H3Event } from "h3";

export default defineEventHandler(async (event: H3Event) => {
    const userId = await getUserFromToken(event);

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
