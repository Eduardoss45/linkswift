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

  await redis.set(`${key}`, JSON.stringify(linkData), 'EX', 60 * 60 * 24 * dias);

  if (criado_por) {
    await UserModel.findByIdAndUpdate(criado_por, { $push: { links: newLink._id } });
  }

  const shortUrl = `${process.env.BASE_URL_FRONTEND}/${key}`;
  return successResponse(res, 201, 'Link encurtado com sucesso', { url: shortUrl });
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

    // 🔒 Links privados
    if (linkData.privado) {
      const userId = req.user?._id?.toString();

      if (!userId) {
        return next(
          new BadRequestError({
            message: 'Autenticação necessária.',
            context: { reason: 'auth_required', redirect: '/login' },
          })
        );
      }

      if (linkData.criado_por !== userId) {
        return next(
          new ForbiddenError({
            message: 'Acesso negado. Este link pertence a outro usuário.',
          })
        );
      }

      // ✅ Interrompe o fluxo aqui se o usuário não é dono
    }

    // 🔑 Links com senha
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

    // 🌐 Redirecionamento final
    return res.redirect(linkData.url);
  } catch (err) {
    console.error('⚠️ Erro inesperado em redirectToLinks:', err);
    next(err);
  }
};

// export async function listAllLinks(req: Request, res: Response, next: NextFunction): Promise<void> {
//   const _id = typeof req.user?._id === 'object' ? req.user._id.toString() : null;
//   if (!_id) {
//     throw new BadRequestError({
//       message: 'Usuário não autenticado',
//     });
//   }
//
//   const user = await UserModel.findById(_id).lean();
//   if (!user || !user.links || user.links.length === 0) {
//     return successResponse(res, 200, 'Nenhum link encontrado', {
//       links: [],
//     });
//   }
//
//   const userLinkIds = new Set(user.links);
//   const links: { id: string; data: RedisLinkData }[] = [];
//
//   let cursor = 0;
//   do {
//     const [newCursor, keys] = await redis.scan(cursor, 'MATCH', 'short:*', 'COUNT', 100);
//
//     const values = await Promise.all(
//       keys.map(async key => {
//         const id = key.replace('short:', '');
//         if (!userLinkIds.has(id)) return null;
//         const value = await redis.get(key);
//         if (!value) return null;
//         try {
//           const parsed = JSON.parse(value);
//           return { id, data: parsed };
//         } catch {
//           return null;
//         }
//       })
//     );
//
//     links.push(...values.filter((v): v is { id: string; data: RedisLinkData } => v !== null));
//     cursor = Number(newCursor);
//   } while (cursor !== 0);
//   return successResponse(res, 200, 'Links encontrados com sucesso', {
//     links,
//   });
// }
//
// export async function updateLinks(req: Request, res: Response, next: NextFunction): Promise<void> {
//   const { id } = req.params;
//   const { url, nome, password, exclusive } = req.body;
//   const linkDataStr = await redis.get(`short:${id}`);
//   if (!linkDataStr) {
//     throw new NotFoundError({
//       message: 'Link não encontrado.',
//     });
//   }
//
//   const ttl = await redis.ttl(`short:${id}`);
//   const validTTL = ttl > 0 ? ttl : 60 * 60 * 24 * 7;
//   const linkData = JSON.parse(linkDataStr);
//   const isExclusive = exclusive === true;
//   const hasPassword = typeof password === 'string' && password.trim() !== '';
//   if (isExclusive && hasPassword) {
//     throw new BadRequestError({
//       message: 'Links exclusivos não podem ter senha.',
//     });
//   }
//   if (typeof url === 'string' && url.trim() !== '') linkData.url = url.trim();
//   if (typeof nome === 'string') linkData.nome = nome.trim();
//   if (exclusive !== undefined) linkData.exclusive = isExclusive;
//   if (password !== undefined) {
//     linkData.password = typeof password === 'string' ? password.trim() : linkData.password || '';
//   }
//   await redis.set(`${id}`, JSON.stringify(linkData), 'EX', validTTL);
//   return successResponse(res, 200, 'Link atualizado com sucesso', {
//     id,
//     url: linkData.url,
//   });
// }
//
// export async function deleteLinks(req: Request, res: Response, next: NextFunction): Promise<void> {
//   const { id } = req.params;
//   const _id = typeof req.user?._id === 'object' ? req.user._id.toString() : null;
//   if (!_id) {
//     throw new BadRequestError({
//       message: 'Usuário não autenticado',
//     });
//   }
//   const user = await UserModel.findById(_id);
//   if (!user || !user.links.includes(id)) {
//     throw new ForbiddenError({
//       message: 'Este link não pertence ao usuário',
//     });
//   }
//   await redis.del(`short:${id}`);
//   user.links = user.links.filter((linkId: string) => linkId !== id);
//   await user.save();
//   return successResponse(res, 200, 'Link deletado com sucesso');
// }

export const checkLink = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { key } = req.params;
  const link = await redis.get(key);

  if (!link) {
    throw new NotFoundError({
      message: 'Link não encontrado.',
    });
  }

  const linkData = JSON.parse(link);

  return successResponse(res, 200, 'Link encontrado', {
    privado: !!linkData.privado,
    senhaNecessaria: !!linkData.senha,
    url: linkData.senha ? null : linkData.url,
  });
};

export const helloLinkSwift = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  res.status(200).json({ message: '✅ Rotas online!' });
};
