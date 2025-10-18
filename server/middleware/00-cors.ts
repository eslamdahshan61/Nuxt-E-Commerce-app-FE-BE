export default defineEventHandler((event) => {
  const { corsAllowedOrigins } = useRuntimeConfig();
  const originHeader = getHeader(event, 'origin') || '';

  // Normalize allowed origins list
  const allowed = (corsAllowedOrigins || '')
    .split(',')
    .map((o: string) => o.trim())
    .filter(Boolean);

  const isWildcard = allowed.includes('*');
  const isAllowed = isWildcard || (originHeader && allowed.includes(originHeader));

  if (isAllowed) {
    setHeader(event, 'Access-Control-Allow-Origin', isWildcard ? '*' : originHeader);
    // Note: credentials cannot be used with '*' per spec; only set when specific origin
    if (!isWildcard) {
      setHeader(event, 'Access-Control-Allow-Credentials', 'true');
    }
  }

  setHeader(event, 'Vary', 'Origin');
  setHeader(event, 'Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  setHeader(event, 'Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (event.method === 'OPTIONS') {
    setResponseStatus(event, 204);
    return null;
  }
});


