import { Request, Response } from 'express';
import { ioRedisClient } from '../cache/ioRedis.js';

const redis = ioRedisClient();

export const redirectPublicLink = async (req: Request, res: Response) => {
  const { key } = req.params;

  const data = await redis.get(key);
  if (!data) {
    res.status(404).json({ message: 'Link não encontrado.' });
    return;
  }

  const link = JSON.parse(data);

  if (link.privado || link.senha) {
    res.status(400).json({ message: 'Link não é público.' });
    return;
  }

  res.redirect(link.url);
};
