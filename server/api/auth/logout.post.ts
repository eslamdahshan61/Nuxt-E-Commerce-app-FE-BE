import type { H3Event } from "h3";

export default defineEventHandler(async (event: H3Event) => {
    const userId = await getUserFromToken(event);
    const token = extractTokenFromHeader(event);

    if (!token) {
        throw createError({
            statusCode: 401,
            statusMessage: "No token provided",
        });
    }

    await deleteToken(userId);

    const config = useRuntimeConfig();
    const expiresIn = getExpirationTime(config.jwtExpiration || "24h");
    await blacklistToken(token, expiresIn);

    return {
        message: "Logged out successfully",
    };
});
