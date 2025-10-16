export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('error', (error, { event }) => {
    if (!event) return;
    
    const isDev = process.env.NODE_ENV === 'development';
    const h3Error = error as any;
    const statusCode = h3Error.statusCode || 500;

    setResponseStatus(event, statusCode);

    const response: any = {
      success: false,
      statusCode,
      message: h3Error.statusMessage || error.message || 'An error occurred',
    };

    if (isDev && h3Error.data) {
      response.details = h3Error.data;
    }

    if (statusCode === 500 && isDev) {
      console.error('Server error:', error);
    }

    return send(event, JSON.stringify(response));
  });
});
