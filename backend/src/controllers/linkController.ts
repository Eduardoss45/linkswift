import { Request, Response } from 'express';
import UserModel from '../models/User.js';
import LinkModel from '../models/Link.js';
import bcrypt from 'bcrypt';
import {
  ioRedisClient,
  checkUrl,
  generateKey,
  sendErrorResponse,
  sendSuccessResponse,
} from '../utils/helpers.js';
import { LinkData, RedisLinkData } from '../types/types.js';

const redis = ioRedisClient();

// * encurta links
export async function shortenLinks(req: Request, res: Response): Promise<void> {
  const { url, senha, nome, expira_em, privado } = req.body;
  const criado_por = typeof req.user?._id === 'object' ? req.user._id.toString() : null;
  if ((privado || (typeof nome === 'string' && nome.trim())) && !criado_por) {
    return sendErrorResponse(res, 401, 'Links privados ou nomeados requerem autenticação.');
  }
  if (privado && senha) {
    return sendErrorResponse(res, 400, 'Links privados não podem ter senha.');
  }
  if (!url || !checkUrl(url)) {
    return sendErrorResponse(res, 400, 'URL inválida ou não fornecida');
  }
  try {
    let key: string;
    do {
      key = generateKey();
    } while (await LinkModel.exists({ key }));
    let senhaHash: string | null = null;
    if (senha) {
      if (senha.length < 6) {
        return sendErrorResponse(res, 400, 'A senha deve ter no mínimo 6 caracteres.');
      }
      senhaHash = await bcrypt.hash(senha, 10);
    }
    const newLink = await LinkModel.create({
      url,
      key,
      senha: senhaHash,
      privado,
      expira_em,
      criado_por,
    });
    const linkData: LinkData = {
      _id: newLink._id,
      url,
      key,
      senha: senhaHash,
      privado: !!privado,
      expira_em: expira_em || null,
      nome: nome || null,
      criado_por: newLink.criado_por || null,
      criado_em: newLink.criado_em,
    };
    await redis.set(`${key}`, JSON.stringify(linkData), 'EX', 60 * 60 * 24 * 7);
    if (criado_por) {
      await UserModel.findByIdAndUpdate(criado_por, { $push: { links: newLink._id } });
    }
    const shortUrl = `${process.env.BASE_URL}/${key}`;
    return sendSuccessResponse(res, 201, 'Link encurtado com sucesso', { url: shortUrl });
  } catch (error) {
    return sendErrorResponse(res, 400, (error as Error).message);
  }
}

// * redireciona e protege links
export async function redirectToLinks(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const linkDataStr = await redis.get(`short:${id}`);
  if (!linkDataStr) {
    return sendErrorResponse(res, 404, 'Link não encontrado.');
  }
  const linkData = JSON.parse(linkDataStr);
  if (linkData.exclusive) {
    const userId = req.user?._id?.toString();
    if (!userId) {
      return sendErrorResponse(res, 401, 'Autenticação necessária.', {
        reason: 'auth_required',
        redirect: '/login',
      });
    }
    const userOwnsLink = await UserModel.exists({
      _id: userId,
      links: id,
    });
    if (!userOwnsLink) {
      return sendErrorResponse(res, 403, 'Acesso negado ao link exclusivo.');
    }
  }
  if (linkData.password) {
    return sendErrorResponse(res, 401, 'Senha necessária para acessar o link.', {
      reason: 'password_required',
      redirect: `/password/${id}`,
    });
  }
  return res.redirect(linkData.url);
}

// * lista de links do usuário
// export async function listAllLinks(req: Request, res: Response): Promise<void> {
//   const _id = typeof req.user?._id === 'object' ? req.user._id.toString() : null;
//   if (!_id) {
//     return sendErrorResponse(res, 401, 'Usuário não autenticado');
//   }

//   const user = await UserModel.findById(_id).lean();
//   if (!user || !user.links || user.links.length === 0) {
//     return sendSuccessResponse(res, 200, 'Nenhum link encontrado', {
//       links: [],
//     });
//   }

//   const userLinkIds = new Set(user.links);
//   const links: { id: string; data: RedisLinkData }[] = [];

//   let cursor = 0;
//   do {
//     const [newCursor, keys] = await redis.scan(cursor, 'MATCH', 'short:*', 'COUNT', 100);

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

//     links.push(...values.filter((v): v is { id: string; data: RedisLinkData } => v !== null));
//     cursor = Number(newCursor);
//   } while (cursor !== 0);
//   return sendSuccessResponse(res, 200, 'Links encontrados com sucesso', {
//     links,
//   });
// }

// * atualiza um link do usuário
// export async function updateLinks(req: Request, res: Response): Promise<void> {
//   const { id } = req.params;
//   const { url, nome, password, exclusive } = req.body;
//   const linkDataStr = await redis.get(`short:${id}`);
//   if (!linkDataStr) {
//     return sendErrorResponse(res, 404, 'Link não encontrado');
//   }
//   const ttl = await redis.ttl(`short:${id}`);
//   const validTTL = ttl > 0 ? ttl : 60 * 60 * 24 * 7;
//   const linkData = JSON.parse(linkDataStr);
//   const isExclusive = exclusive === true;
//   const hasPassword = typeof password === 'string' && password.trim() !== '';
//   if (isExclusive && hasPassword) {
//     return sendErrorResponse(res, 400, 'Links exclusivos não podem ter senha');
//   }
//   if (typeof url === 'string' && url.trim() !== '') linkData.url = url.trim();
//   if (typeof nome === 'string') linkData.nome = nome.trim();
//   if (exclusive !== undefined) linkData.exclusive = isExclusive;
//   if (password !== undefined) {
//     linkData.password = typeof password === 'string' ? password.trim() : linkData.password || '';
//   }
//   await redis.set(`${id}`, JSON.stringify(linkData), 'EX', validTTL);
//   return sendSuccessResponse(res, 200, 'Link atualizado com sucesso', {
//     id,
//     url: linkData.url,
//   });
// }

// * deleta links do usuário
// export async function deleteLinks(req: Request, res: Response): Promise<void> {
//   const { id } = req.params;
//   const _id = typeof req.user?._id === 'object' ? req.user._id.toString() : null;
//   if (!_id) {
//     return sendErrorResponse(res, 401, 'Usuário não autenticado');
//   }
//   const user = await UserModel.findById(_id);
//   if (!user || !user.links.includes(id)) {
//     return sendErrorResponse(res, 403, 'Este link não pertence ao usuário');
//   }
//   await redis.del(`short:${id}`);
//   user.links = user.links.filter((linkId: string) => linkId !== id);
//   await user.save();
//   return sendSuccessResponse(res, 200, 'Link deletado com sucesso');
// }

// * status do servidor
export async function helloLinkSwift(req: Request, res: Response): Promise<void> {
  res.status(200).json({ message: '✅ Rotas online!' });
}
