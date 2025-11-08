import { NextFunction, Request, Response } from 'express';
import BadRequestError from '../errors/BadRequestError.js';
import LinkModel from '../models/linkModel.js';
import NotFoundError from '../errors/NotFoundError.js';
import UnauthorizedError from '../errors/UnauthorizedError.js';
import { ioRedisClient } from '../cache/ioRedis.js';
import { successResponse } from '../utils/response.js';
import jwt, { JwtPayload } from 'jsonwebtoken';

const redis = ioRedisClient();

interface AccessTokenPayload extends JwtPayload {
  userId: string;
}

interface LinkData {
  key: string;
  url: string;
  privado: boolean;
  criado_por: string;
  [key: string]: any;
}

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

    let payload: AccessTokenPayload;
    try {
      payload = jwt.verify(accessToken, process.env.ACCESS_SECRET!) as AccessTokenPayload;
    } catch {
      throw new UnauthorizedError({ message: 'Token inválido ou expirado.' });
    }

    const cachedData = await redis.get(key);
    let linkData: LinkData;

    if (cachedData) {
      linkData = JSON.parse(cachedData) as LinkData;
    } else {
      const linkFromDB = await LinkModel.findOne({ key }).lean<LinkData>();
      if (!linkFromDB) {
        throw new NotFoundError({ message: 'Link não encontrado.' });
      }
      linkData = linkFromDB;
      await redis.set(key, JSON.stringify(linkData), 'EX', 3600);
    }

    if (!linkData.privado) {
      throw new BadRequestError({ message: 'Este link não é privado.' });
    }

    if (linkData.criado_por.toString() !== payload.userId) {
      throw new UnauthorizedError({ message: 'Acesso negado. Link pertence a outro usuário.' });
    }

    const ip = req.ip ?? '0.0.0.0';
    const redisKey = `link:${key}:ip:${ip}`;

    if (await redis.get(redisKey)) {
      return successResponse(res, 200, 'Redirecionando.', { url: linkData.url });
    }

    await redis.set(redisKey, '1', 'EX', 5);

    const hoje = new Date().toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
    const link = await LinkModel.findOne({ key });
    if (link) {
      const analytics = link.analytics;
      analytics.total_clicks++;

      const clicksPorDia = Array.isArray(analytics.clicks_por_dia) ? analytics.clicks_por_dia : [];

      const diaExistente = clicksPorDia.find(d => d.data === hoje);
      if (diaExistente) diaExistente.quantidade++;
      else clicksPorDia.push({ data: hoje, quantidade: 1 });

      analytics.clicks_por_dia = clicksPorDia;

      analytics.ultimos_ips.push(ip);
      if (analytics.ultimos_ips.length > 10)
        analytics.ultimos_ips = analytics.ultimos_ips.slice(-10);

      await link.save();
    }

    return successResponse(res, 200, 'Redirecionando.', { url: linkData.url });
  } catch (error) {
    next(error);
  }
};
