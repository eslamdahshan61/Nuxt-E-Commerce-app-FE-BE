import type { H3Error } from 'h3';

export function formatError(error: H3Error) {
  const isDev = process.env.NODE_ENV === 'development';
  const statusCode = error.statusCode || 500;

  const response: any = {
    success: false,
    statusCode,
    message: error.statusMessage || error.message || 'An error occurred',
  };

  if (isDev && error.data) {
    response.details = error.data;
  }

  if (statusCode === 500 && isDev) {
    console.error('Server error:', error);
  }

  return response;
}
