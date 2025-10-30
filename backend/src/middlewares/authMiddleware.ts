import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import UserModel from '../models/userModel.js';
import { TokenPayload } from '../types/types.js';

async function verifyTokenAndGetUser(token?: string) {
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || '') as TokenPayload;
    const user = await UserModel.findById(decoded.userId).select('_id email');
    return user;
  } catch {
    return null;
  }
}

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const headerToken =
      authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
    const cookieToken = req.cookies?.token || req.cookies?.accessToken || req.cookies?.refreshToken;
    const token = headerToken || cookieToken;
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
  } catch (err) {
    console.error('Erro no authenticateToken:', err);
    res.status(500).json({
      success: false,
      message: 'Erro interno na autenticação.',
    });
  }
};

export const optionalAuthenticateToken = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const headerToken =
      authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
    const cookieToken = req.cookies?.token || req.cookies?.accessToken || req.cookies?.refreshToken;
    const token = headerToken || cookieToken;
    const user = await verifyTokenAndGetUser(token);
    if (user) {
      req.user = user;
    }
  } catch (err) {
    console.warn('Falha silenciosa no optionalAuthenticateToken:', err);
  }
  next();
};
