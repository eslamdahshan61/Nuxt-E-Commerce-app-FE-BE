import { loginSchema } from '../../schemas/validation.schemas.ts';
import { handleSafeError } from '../../utils/safeError';

export default defineEventHandler(async (event) => {
  try {
  const body = await readBody(event);
  const validatedData = await validateBody(loginSchema, body);
  const { identifier, password } = validatedData;

  const isEmail = identifier.includes('@');
  
  const user = await prisma?.user.findUnique({
    where: isEmail ? { email: identifier } : { username: identifier },
  });

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid email/username or password',
    });
  }

  const isPasswordValid = await comparePassword(password, user.password);

  if (!isPasswordValid) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid email/username or password',
    });
  }

  const token = generateToken(user.id);
  const config = useRuntimeConfig();
  const expiresIn = getExpirationTime(config.jwtExpiration || '24h');

  await setToken(user.id, token, expiresIn);

  return {
    success: true,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
    },
    accessToken: token,
    tokenType: 'Bearer',
  };
  } catch (error) {
    handleSafeError(error, 'Failed to login');
  }
});
