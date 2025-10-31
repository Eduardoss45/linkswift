import { NextFunction, Request, Response } from 'express';
import { LinkData } from '../types/types.js';
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

    const criado_por = req.user?._id
      ? typeof req.user._id === 'object'
        ? req.user._id.toString()
        : req.user._id
      : null;

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

    let token: string | null = null;
    if (privado) {
      token = crypto.randomBytes(8).toString('hex');
    }

    const checkUrl = (url: string): boolean => {
      try {
        new URL(url);
        return true;
      } catch {
        return false;
      }
    };

    if (!url || !checkUrl(url)) {
      throw new BadRequestError({
        message: 'URL inválida ou não fornecida',
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
      token,
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

    if (privado && token) {
      await redis.set(`handshake:${key}:${token}`, JSON.stringify(linkData), 'EX', 60 * 60);
    }

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

export const handshakeVerify = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { key, token } = req.body;
    if (!key || !token) {
      throw new BadRequestError({ message: 'Chave e token são obrigatórios.' });
    }

    const cacheKey = `handshake:${key}:${token}`;
    let data = await redis.get(cacheKey);

    if (!data) {
      const link = await LinkModel.findOne({ key, token });
      if (!link) throw new UnauthorizedError({ message: 'Token inválido.' });
      if (link.handshake_usado) throw new ForbiddenError({ message: 'Token já utilizado.' });
      if (link.expira_em && new Date(link.expira_em) < new Date())
        throw new BadRequestError({ message: 'Link expirado.' });

      link.handshake_usado = true;
      await link.save();

      let ttl = 3600;
      if (link.expira_em) {
        const diff = (new Date(link.expira_em).getTime() - Date.now()) / 1000;
        ttl = Math.min(3600, Math.max(60, diff));
      }
      await redis.set(cacheKey, JSON.stringify(link), 'EX', ttl);

      await redis.set(cacheKey, JSON.stringify(link), 'EX', ttl);
      data = JSON.stringify(link);
    } else {
      await LinkModel.updateOne({ key, token, handshake_usado: false }, { handshake_usado: true });
    }

    const { url } = JSON.parse(data);

    await redis.del(cacheKey);
    return successResponse(res, 200, 'Redirecionamento autorizado', { url });
  } catch (err) {
    next(err);
  }
};

export const checkLink = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { key } = req.params;
    const link = await redis.get(key);

    if (!link) {
      // busca no MongoDB como fallback
      const dbLink = await LinkModel.findOne({ key });
      if (!dbLink) {
        // ainda usa NotFoundError, mas dentro do try/catch
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
    // qualquer erro cai aqui e não derruba o servidor
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
