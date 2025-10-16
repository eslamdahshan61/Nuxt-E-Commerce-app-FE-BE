import { registerSchema } from '../../schemas/validation.schemas.ts';
import { handleSafeError } from '../../utils/safeError';

export default defineEventHandler(async (event) => {
  try {
  const body = await readBody(event);
  const validatedData = await validateBody(registerSchema, body);
  const { username, email, password } = validatedData;

  const existingUser = await prisma?.user.findFirst({
    where: {
      OR: [
        { username },
        { email },
      ],
    },
  });

  if (existingUser) {
    throw createError({
      statusCode: 409,
      statusMessage: 'User with this username or email already exists',
    });
  }

  const hashedPassword = await hashPassword(password);

  const user = await prisma?.user.create({
    data: {
      username,
      email,
      password: hashedPassword,
    },
  });

  const token = generateToken(user!.id);
  const config = useRuntimeConfig();
  const expiresIn = getExpirationTime(config.jwtExpiration || '24h');

  await setToken(user!.id, token, expiresIn);

  return {
    success: true,
    user: {
      id: user!.id,
      username: user!.username,
      email: user!.email,
    },
    accessToken: token,
    tokenType: 'Bearer',
  };
  } catch (error) {
    handleSafeError(error, 'Failed to register user');
  }
});
