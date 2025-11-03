import { NextFunction, Request, Response } from 'express';
import BadRequestError from '../errors/BadRequestError.js';
import Link from '../models/linkModel.js';
import NotFoundError from '../errors/NotFoundError.js';
import UnauthorizedError from '../errors/UnauthorizedError.js';
import { ioRedisClient } from '../cache/ioRedis.js';
import { successResponse } from '../utils/response.js';
import jwt, { JwtPayload } from 'jsonwebtoken';

const redis = ioRedisClient();

// Tipagem para o payload do JWT
interface AccessTokenPayload extends JwtPayload {
  userId: string;
}

// Tipagem para os dados do link
interface LinkData {
  key: string;
  url: string;
  privado: boolean;
  criado_por: string;
  [key: string]: any;
}

// Tipagem para o Request com cookies
interface RequestWithCookies extends Request {
  cookies: {
    accessToken?: string;
    [key: string]: any;
  };
}

export const redirectPrivateLink = async (
  req: RequestWithCookies,
  res: Response,
  next: NextFunction
) => {
  try {
    const { key } = req.params;
    const accessToken = req.cookies?.accessToken;

    if (!accessToken) {
      throw new UnauthorizedError({ message: 'Token de acesso não fornecido.' });
    }

    // Verifica e decodifica o token
    let payload: AccessTokenPayload;
    try {
      payload = jwt.verify(accessToken, process.env.ACCESS_SECRET!) as AccessTokenPayload;
    } catch (err) {
      throw new UnauthorizedError({ message: 'Token inválido ou expirado.' });
    }

    // Busca link no Redis
    const cachedData = await redis.get(key);
    let linkData: LinkData;

    if (cachedData) {
      linkData = JSON.parse(cachedData) as LinkData;
    } else {
      // Busca link no MongoDB caso não esteja no cache
      const linkFromDB = await Link.findOne({ key }).lean<LinkData>();
      if (!linkFromDB) {
        throw new NotFoundError({ message: 'Link não encontrado.' });
      }
      linkData = linkFromDB;
      await redis.set(key, JSON.stringify(linkData), 'EX', 3600); // cache por 1h
    }

    // Valida se é privado
    if (!linkData.privado) {
      throw new BadRequestError({ message: 'Este link não é privado.' });
    }

    // Verifica se o usuário é o dono do link
    if (linkData.criado_por.toString() !== payload.userId) {
      throw new UnauthorizedError({ message: 'Acesso negado. Link pertence a outro usuário.' });
    }

    return successResponse(res, 200, 'Redirecionando.', { url: linkData.url });
  } catch (error) {
    next(error);
  }
};
