import { Request, Response } from 'express';
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
