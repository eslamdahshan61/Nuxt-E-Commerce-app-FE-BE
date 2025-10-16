import { createError } from 'h3';

export function handleSafeError(error: any, defaultMessage: string = 'An error occurred'): never {
  const errorDetails = {
    message: error.message,
    code: error.code,
    name: error.name,
    statusCode: error.statusCode,
    timestamp: new Date().toISOString(),
  };

  if (error.code && error.code.startsWith('P')) {
    throw createError({
      statusCode: 500,
      statusMessage: 'A database error occurred. Please try again later.',
    });
  }

  if (error.statusCode && error.statusMessage) {
    throw error;
  }

  if (error.name === 'ValidationError') {
    throw error;
  }

  if (error.code === 'ETIMEDOUT' || error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
    throw createError({
      statusCode: 503,
      statusMessage: 'Service temporarily unavailable. Please try again later.',
    });
  }

  throw createError({
    statusCode: 500,
    statusMessage: defaultMessage,
  });
}

export function withSafeError<T extends (...args: any[]) => Promise<any>>(
  handler: T,
  defaultMessage?: string
): T {
  return (async (...args: any[]) => {
    try {
      return await handler(...args);
    } catch (error) {
      handleSafeError(error, defaultMessage);
    }
  }) as T;
}
