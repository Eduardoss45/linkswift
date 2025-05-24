import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import { createClient } from "redis";
import { LinkData } from "../types/types";

export async function hashPassword(plainText: string): Promise<string> {
  return await bcrypt.hash(plainText, 12);
}

export async function comparePassword(
  plainText: string,
  hashed: string
): Promise<boolean> {
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

export function generateId(): string {
  return crypto.randomBytes(3).toString("hex");
}

export const decodeJWT = (req: Request): string | null => {
  const authHeader = req.headers["authorization"];
  if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
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

export async function redisClient() {
  const redis = createClient({
    url: process.env.REDIS_URL || "redis://127.0.0.1:6379",
    socket: { connectTimeout: 5000, reconnectStrategy: 3 },
  });
  redis.on("error", (err) => {
    console.error("Erro ao conectar ao Redis:", err);
  });
  await redis.connect();
  return redis;
}

export async function createHashedLinkData({
  url,
  _id = null,
  exclusive = false,
  password = null,
  name = null,
}: {
  url: string;
  _id?: string | null;
  exclusive?: boolean;
  password?: string | null;
  name?: string | null,
}): Promise<LinkData> {
  if ((exclusive || name) && !_id) {
    throw new Error("Links exclusivos ou nomeados requerem autenticação.");
  }
  if (exclusive && password) {
    throw new Error("Link exclusivo não pode ter senha.");
  }
  let hashedPassword: string | null = null;
  if (password !== null && password !== undefined) {
    const strPassword = String(password).trim();

    if (strPassword.length === 0) {
      throw new Error('A senha não pode ser vazia.');
    }
    hashedPassword = await hashPassword(strPassword);
  }
  return {
    url,
    _id,
    exclusive,
    password: hashedPassword,
    name,
  };
}