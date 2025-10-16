export default defineEventHandler(async (event) => {
  return sendRedirect(event, '/api-docs', 301);
});
