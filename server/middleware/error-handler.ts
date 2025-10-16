export default defineEventHandler(async (event) => {
  try {
    await event.node.req;
  } catch (error: any) {
    const isDev = process.env.NODE_ENV === 'development';
    
    if (error.statusCode) {
      setResponseStatus(event, error.statusCode);
      return {
        success: false,
        message: error.statusMessage || error.message || 'An error occurred',
        ...(isDev && error.data && { details: error.data }),
      };
    }

    console.error('Unexpected error:', error);
    
    setResponseStatus(event, 500);
    return {
      success: false,
      message: 'Internal server error',
      ...(isDev && { error: error.message }),
    };
  }
});
