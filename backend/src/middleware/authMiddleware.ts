import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import UserModel from '../models/User.js';
import { TokenPayload } from '../types/types.js';

async function verifyTokenAndGetUser(token?: string) {
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || '') as TokenPayload;
    const user = await UserModel.findById(decoded.userId);
    return user;
  } catch {
    return null;
  }
}

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];
  const user = await verifyTokenAndGetUser(token);
  if (!user) {
    res.status(401).json({
      success: false,
      message: 'Acesso negado. Token inválido ou não fornecido.',
    });
    return;
  }
  req.user = user;
  next();
};

export const optionalAuthenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];
  const user = await verifyTokenAndGetUser(token);

  if (user) {
    req.user = user;
  }
  next();
};
