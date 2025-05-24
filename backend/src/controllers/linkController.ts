import { Request, Response } from 'express';
import UserModel from '../models/User.js';
import {
  redisClient,
  checkUrl,
  generateId,
  createHashedLinkData,
  sendErrorResponse,
  sendSuccessResponse,
} from '../utils/helpers.js';
const redis = await redisClient();

// * encurta salva links
export async function shortenLinks(req: Request, res: Response): Promise<void> {
  const { url, password, name, exclusive } = req.body;
  const _id = typeof req.user?._id === 'object' ? req.user._id.toString() : null;
  if (!url || !checkUrl(url)) {
    return sendErrorResponse(res, 400, 'URL inválida ou não fornecida');
  }
  const id = generateId();
  const shortUrl = `${process.env.BASE_URL}/${id}`;
  try {
    const linkData = await createHashedLinkData({
      url,
      _id,
      exclusive,
      password,
      name,
    });
    await redis.set(`short:${id}`, JSON.stringify(linkData), { EX: 60 * 60 * 24 * 7 });
    if (_id) {
      await UserModel.findByIdAndUpdate(_id, { $push: { links: id } }, { new: true });
    }
    return sendSuccessResponse(res, 201, 'Link encurtado com sucesso', {
      shortUrl,
      id,
    });
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
export async function listAllLinks(req: Request, res: Response): Promise<void> {
  const _id = typeof req.user?._id === 'object' ? req.user._id.toString() : null;
  if (!_id) {
    return sendErrorResponse(res, 401, 'Usuário não autenticado');
  }

  const user = await UserModel.findById(_id).lean();
  if (!user || !user.links || user.links.length === 0) {
    return sendSuccessResponse(res, 200, 'Nenhum link encontrado', {
      links: [],
    });
  }

  const userLinkIds = new Set(user.links);
  const links: { id: string; data: any }[] = [];

  let cursor = 0;
  do {
    const { cursor: newCursor, keys } = await redis.scan(cursor, {
      MATCH: 'short:*',
      COUNT: 100,
    });

    const values = await Promise.all(
      keys.map(async key => {
        const id = key.replace('short:', '');
        if (!userLinkIds.has(id)) return null;
        const value = await redis.get(key);
        if (!value) return null;
        try {
          const parsed = JSON.parse(value);
          return { id, data: parsed };
        } catch {
          return null;
        }
      })
    );

    links.push(...values.filter((v): v is { id: string; data: any } => v !== null));
    cursor = Number(newCursor);
  } while (cursor !== 0);
  return sendSuccessResponse(res, 200, 'Links encontrados com sucesso', {
    links,
  });
}

// * atualiza um link do usuário
export async function updateLinks(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const { url, name, password, exclusive } = req.body;
  const linkDataStr = await redis.get(`short:${id}`);
  if (!linkDataStr) {
    return sendErrorResponse(res, 404, 'Link não encontrado');
  }
  const ttl = await redis.ttl(`short:${id}`);
  const validTTL = ttl > 0 ? ttl : 60 * 60 * 24 * 7;
  const linkData = JSON.parse(linkDataStr);
  const isExclusive = exclusive === true;
  const hasPassword = typeof password === 'string' && password.trim() !== '';
  if (isExclusive && hasPassword) {
    return sendErrorResponse(res, 400, 'Links exclusivos não podem ter senha');
  }
  if (typeof url === 'string' && url.trim() !== '') linkData.url = url.trim();
  if (typeof name === 'string') linkData.name = name.trim();
  if (exclusive !== undefined) linkData.exclusive = isExclusive;
  if (password !== undefined) {
    linkData.password = typeof password === 'string' ? password.trim() : linkData.password || '';
  }
  await redis.set(`short:${id}`, JSON.stringify(linkData), { EX: validTTL });
  return sendSuccessResponse(res, 200, 'Link atualizado com sucesso', {
    id,
    url: linkData.url,
  });
}

// * deleta links do usuário
export async function deleteLinks(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const _id = typeof req.user?._id === 'object' ? req.user._id.toString() : null;
  if (!_id) {
    return sendErrorResponse(res, 401, 'Usuário não autenticado');
  }
  const user = await UserModel.findById(_id);
  if (!user || !user.links.includes(id)) {
    return sendErrorResponse(res, 403, 'Este link não pertence ao usuário');
  }
  await redis.del(`short:${id}`);
  user.links = user.links.filter((linkId: string) => linkId !== id);
  await user.save();
  return sendSuccessResponse(res, 200, 'Link deletado com sucesso');
}

// * status do servidor
export async function helloLinkSwift(req: Request, res: Response): Promise<void> {
  res.status(200).json({ message: '✅ Rotas online!' });
}
