import jwt from 'jsonwebtoken';
import type { H3Event } from 'h3';
import { isTokenBlacklisted } from './redis';

export interface JwtPayload {
  sub: number;
  iat?: number;
  exp?: number;
}

export const generateToken = (userId: number): string => {
  const config = useRuntimeConfig();
  return jwt.sign(
    { sub: userId },
    config.jwtSecret,
    { expiresIn: config.jwtExpiration || '24h' }
  );
};

export const verifyToken = (token: string): JwtPayload => {
  const config = useRuntimeConfig();
  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    if (typeof decoded === 'string') {
      throw new Error('Invalid token format');
    }
    return {
      sub: Number(decoded.sub),
      iat: decoded.iat,
      exp: decoded.exp,
    };
  } catch (error) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid or expired token',
    });
  }
};

export const extractTokenFromHeader = (event: H3Event): string | null => {
  const authorization = getHeader(event, 'authorization');
  if (!authorization) return null;

  const parts = authorization.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null;

  return parts[1];
};

export const getUserFromToken = async (event: H3Event): Promise<number> => {
  const token = extractTokenFromHeader(event);
  
  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: 'No token provided',
    });
  }

  const blacklisted = await isTokenBlacklisted(token);
  if (blacklisted) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Token has been revoked',
    });
  }

  const payload = verifyToken(token);
  return payload.sub;
};

export const getExpirationTime = (expiration: string = '24h'): number => {
  const match = expiration.match(/(\d+)([smhd])/);
  if (!match) return 86400;

  const value = parseInt(match[1]);
  const unit = match[2];

  const multipliers: Record<string, number> = {
    s: 1,
    m: 60,
    h: 3600,
    d: 86400,
  };

  return value * (multipliers[unit] || 3600);
};
