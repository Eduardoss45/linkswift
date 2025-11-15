import { NextFunction, Request, Response } from 'express';
import { LinkData } from '../types/types.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import UserModel from '../models/userModel.js';
import LinkModel from '../models/linkModel.js';
import BadRequestError from '../errors/BadRequestError.js';
import UnauthorizedError from '../errors/UnauthorizedError.js';
import NotFoundError from '../errors/NotFoundError.js';
import { successResponse } from '../utils/response.js';
import { ioRedisClient } from '../cache/ioRedis.js';

const redis = ioRedisClient();

export async function shortenLinks(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { url, senha, nome, expira_em, privado } = req.body;
    const { accessToken } = req.cookies;

    let criado_por: string | null = null;

    if (accessToken) {
      try {
        const verified = jwt.verify(accessToken, process.env.ACCESS_SECRET || '');
        if (typeof verified !== 'string' && verified.userId) {
          criado_por = verified.userId.toString();
        }
      } catch (err) {
        return next(
          new UnauthorizedError({
            message: 'Token inválido ou expirado. Faça login novamente.',
          })
        );
      }
    }

    if ((privado || (typeof nome === 'string' && nome.trim())) && !criado_por) {
      throw new UnauthorizedError({
        message: 'Links privados ou nomeados requerem autenticação.',
        context: { privado, nome },
      });
    }

    if (privado && senha) {
      throw new BadRequestError({
        message: 'Links privados não podem ter senha.',
        context: { privado, senha },
      });
    }

    try {
      new URL(url);
    } catch {
      throw new BadRequestError({
        message: 'URL inválida ou não fornecida.',
        context: { url },
      });
    }

    let key: string;
    do {
      key = crypto.randomBytes(3).toString('hex');
    } while (await LinkModel.exists({ key }));

    let senhaHash: string | null = null;
    if (senha) {
      if (senha.length < 6) {
        throw new BadRequestError({
          message: 'A senha deve ter no mínimo 6 caracteres.',
          context: { senhaLength: senha.length },
        });
      }
      senhaHash = await bcrypt.hash(senha, 10);
    }

    const dias = parseInt(expira_em) || 7;
    const expira = new Date();
    expira.setDate(expira.getDate() + dias);

    const newLink = await LinkModel.create({
      url,
      key,
      senha: senhaHash,
      privado,
      handshake_usado: false,
      expira_em: expira,
      criado_por,
    });

    const linkData: LinkData = {
      _id: newLink._id,
      url,
      key,
      senha: senhaHash,
      privado: !!privado,
      expira_em: expira.toISOString().split('T')[0],
      nome: nome || null,
      criado_por: newLink.criado_por || null,
      criado_em: newLink.criado_em,
    };

    await redis.set(`${key}`, JSON.stringify(linkData), 'EX', 60 * 60);

    if (criado_por) {
      await UserModel.findByIdAndUpdate(criado_por, { $push: { links: newLink._id } });
    }

    const shortUrl = `${process.env.BASE_URL_FRONTEND}/r/${key}`;
    return successResponse(res, 201, 'Link encurtado com sucesso', { url: shortUrl });
  } catch (error) {
    next(error);
  }
}

export const redirectToLinks = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { key } = req.params;
    const { senha } = req.query as { senha?: string };

    let cacheData = await redis.get(key);
    if (!cacheData) {
      const dbLink = await LinkModel.findOne({ key });
      if (!dbLink) {
        return next(new NotFoundError({ message: 'Link não encontrado.' }));
      }
      await redis.set(key, JSON.stringify(dbLink), 'EX', 3600);
      cacheData = JSON.stringify(dbLink);
    }

    const linkData = JSON.parse(cacheData);

    if (linkData.privado) {
      return next(
        new BadRequestError({
          message: 'Este link é privado e requer handshake.',
          context: {
            reason: 'handshake_required',
            redirect: `${process.env.BASE_URL_FRONTEND}/handshake/${key}`,
          },
        })
      );
    }

    if (linkData.senha) {
      if (!senha) {
        return next(
          new BadRequestError({
            message: 'Senha necessária para acessar o link.',
            context: {
              reason: 'password_required',
              redirect: `${process.env.BASE_URL_FRONTEND}/password/${key}`,
            },
          })
        );
      }

      const senhaValida = await bcrypt.compare(senha, linkData.senha);
      if (!senhaValida) {
        return next(new BadRequestError({ message: 'Senha incorreta.' }));
      }

      return successResponse(res, 201, 'Link autorizado', { url: linkData.url });
    }

    const ip = req.ip ?? '0.0.0.0';
    const redisKey = `link:${key}:ip:${ip}`;

    const cachedClick = await redis.get(redisKey);
    if (cachedClick) {
      return res.redirect(linkData.url);
    }

    await redis.set(redisKey, '1', 'EX', 5);

    const link = await LinkModel.findOne({ key });

    const agora = new Date();
    const hoje = agora.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });

    if (link) {
      const analytics = link.analytics;

      analytics.total_clicks++;

      const clicksPorDia = Array.isArray(analytics.clicks_por_dia) ? analytics.clicks_por_dia : [];

      const hoje = new Date().toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });

      const diaExistente = clicksPorDia.find(d => d.data === hoje);
      if (diaExistente) {
        diaExistente.quantidade++;
      } else {
        clicksPorDia.push({ data: hoje, quantidade: 1 });
      }

      analytics.clicks_por_dia = clicksPorDia;

      analytics.ultimos_ips.push(req.ip ?? '0.0.0.0');
      if (analytics.ultimos_ips.length > 10) {
        analytics.ultimos_ips = analytics.ultimos_ips.slice(-10);
      }

      await link.save();
    }

    return res.redirect(linkData.url);
  } catch (err) {
    next(err);
  }
};

export const checkLink = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { key } = req.params;
    const link = await redis.get(key);

    if (!link) {
      const dbLink = await LinkModel.findOne({ key });
      if (!dbLink) {
        return next(new NotFoundError({ message: 'Link não encontrado.' }));
      }

      await redis.set(key, JSON.stringify(dbLink), 'EX', 3600);
      return successResponse(res, 200, 'Link encontrado', {
        privado: !!dbLink.privado,
        senhaNecessaria: !!dbLink.senha,
        url: dbLink.senha ? null : dbLink.url,
      });
    }

    const linkData = JSON.parse(link);
    return successResponse(res, 200, 'Link encontrado', {
      privado: !!linkData.privado,
      senhaNecessaria: !!linkData.senha,
      url: linkData.senha ? null : linkData.url,
    });
  } catch (err) {
    console.error('⚠️ Erro inesperado em checkLink:', err);
    next(err);
  }
};

export const deleteLink = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { key } = req.params;
    const { accessToken } = req.cookies;

    if (!accessToken) {
      throw new UnauthorizedError({ message: 'Token de acesso não fornecido.' });
    }

    const verified = jwt.verify(accessToken, process.env.ACCESS_SECRET || '');
    if (typeof verified === 'string' || !verified.userId) {
      throw new UnauthorizedError({ message: 'Token inválido ou expirado.' });
    }

    const userId = verified.userId.toString();

    const link = await LinkModel.findOne({ key });

    if (!link) {
      throw new NotFoundError({ message: 'Link não encontrado.' });
    }

    if (link.criado_por?.toString() !== userId) {
      throw new UnauthorizedError({
        message: 'Você não tem permissão para deletar este link.',
      });
    }

    await LinkModel.deleteOne({ key });

    await UserModel.findByIdAndUpdate(userId, { $pull: { links: link._id } });

    await redis.del(key);

    successResponse(res, 200, 'Link deletado com sucesso');
  } catch (err) {
    next(err);
  }
};

export const helloLinkSwift = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  res.status(200).json({ message: '✅ Rotas online!' });
};
