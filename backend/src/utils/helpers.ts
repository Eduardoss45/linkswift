import bcrypt from 'bcrypt';
import Redis, { Redis as RedisClient } from 'ioredis';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import { LinkData } from '../types/types';

export async function hashPassword(plainText: string): Promise<string> {
  return await bcrypt.hash(plainText, 12);
}

export async function comparePassword(plainText: string, hashed: string): Promise<boolean> {
  return await bcrypt.compare(plainText, hashed);
}

export function checkUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function generateKey(): string {
  return crypto.randomBytes(3).toString('hex');
}

export const decodeJWT = (req: Request): string | null => {
  const authHeader = req.headers['authorization'];
  if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
        userId: string;
      };
      return decoded.userId;
    } catch {
      return null;
    }
  }
  return null;
};

export function sendErrorResponse(
  res: Response,
  statusCode: number,
  message: string,
  extra?: Record<string, unknown>
) {
  res.status(statusCode).json({
    message,
    ...(extra || {}),
  });
}

export function sendSuccessResponse<T>(
  res: Response,
  statusCode: number,
  message: string,
  payload?: T
) {
  res.status(statusCode).json(payload ? { message, ...payload } : { message });
}

let redis: RedisClient | null = null;

export function ioRedisClient(): RedisClient {
  if (!redis) {
    redis = new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6379', {
      connectTimeout: 5000,
      retryStrategy(times) {
        if (times > 3) return null;
        return Math.min(times * 50, 2000);
      },
    });

    redis.on('error', (err: Error) => {
      console.error('Erro ao conectar ao Redis:', err);
    });
  }
  return redis;
}
