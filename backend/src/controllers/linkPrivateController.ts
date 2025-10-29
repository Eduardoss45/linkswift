import { Request, Response } from 'express';
import Link from '../models/linkModel.js';
import NotFoundError from '../errors/NotFoundError.js';
import UnauthorizedError from '../errors/UnauthorizedError.js';
import { ioRedisClient } from '../cache/ioRedis.js';
const redis = ioRedisClient();

export const redirectPrivateLink = async (req: Request, res: Response) => {
  const { key } = req.params;
  const userId = req.user?._id?.toString();
  const data = await redis.get(key);

  if (!data) {
    res.status(404).json({ message: 'Link não encontrado.' });
    return;
  }

  const link = JSON.parse(data);

  if (!link.privado) {
    res.status(400).json({ message: 'Este link não é privado.' });
    return;
  }

  if (link.criado_por.toString() !== userId) {
    res.status(403).json({ message: 'Acesso negado. Link pertence a outro usuário.' });
    return;
  }

  res.redirect(link.url);
};

export const redirectPrivateLinkWithCookie = async (req: Request, res: Response) => {
  const { short_id } = req.params;
  const token = req.cookies[`auth_${short_id}`];
  if (!token) {
    throw new UnauthorizedError({ message: 'Autorização necessária' });
  }

  const link = await Link.findOne({ shortUrl: short_id, token });
  if (!link) {
    throw new NotFoundError({ message: 'Link não encontrado' });
  }

  link.analytics.total_clicks += 1;
  await link.save();

  res.clearCookie(`auth_${short_id}`);
  res.redirect(link.originalUrl);
};
