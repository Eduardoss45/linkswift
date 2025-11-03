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
import ForbiddenError from '../errors/ForbiddenError.js';
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
      } catch {
        throw new UnauthorizedError({
          message: 'Token inválido ou expirado. Faça login novamente.',
        });
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

    const shortUrl = `${process.env.BASE_URL_FRONTEND}/${key}`;
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

    const cacheData = await redis.get(key);
    if (!cacheData) {
      return next(new NotFoundError({ message: 'Link não encontrado.' }));
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

    return res.redirect(linkData.url);
  } catch (err) {
    console.error('⚠️ Erro inesperado em redirectToLinks:', err);
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

export const helloLinkSwift = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  res.status(200).json({ message: '✅ Rotas online!' });
};
