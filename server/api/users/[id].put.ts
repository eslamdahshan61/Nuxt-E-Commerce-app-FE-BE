import type { H3Event } from "h3";
import { updateUserSchema, userIdSchema } from '../../schemas/validation.schemas';
import { handleSafeError } from '../../utils/safeError';

export default defineEventHandler(async (event: H3Event) => {
    try {
    const currentUserId = await getUserFromToken(event);

    const id = getRouterParam(event, "id");
    
    const { id: userId } = await validateParams(userIdSchema, { id });
    const numericUserId = Number(userId);

    if (currentUserId !== numericUserId) {
        throw createError({
            statusCode: 403,
            statusMessage: "You can only update your own profile",
        });
    }

    const body = await readBody(event);
    const validatedData = await validateBody(updateUserSchema, body);

    const existing = await prisma?.user.findUnique({
        where: { id: numericUserId },
    });

    if (!existing) {
        throw createError({
            statusCode: 404,
            statusMessage: "User not found",
        });
    }

    const { username, email, password } = validatedData;

    if (username || email) {
        const duplicate = await prisma?.user.findFirst({
            where: {
                AND: [
                    { id: { not: numericUserId } },
                    {
                        OR: [
                            ...(username ? [{ username }] : []),
                            ...(email ? [{ email }] : []),
                        ],
                    },
                ],
            },
        });

        if (duplicate) {
            throw createError({
                statusCode: 409,
                statusMessage: "Username or email already exists",
            });
        }
    }

    const updateData: any = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (password) updateData.password = await hashPassword(password);

    const user = await prisma?.user.update({
        where: { id: numericUserId },
        data: updateData,
        select: {
            id: true,
            username: true,
            email: true,
            createdAt: true,
            updatedAt: true,
        },
    });

    return user;
    } catch (error) {
        handleSafeError(error, 'Failed to update user');
    }
});
