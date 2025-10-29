import { Request, Response } from 'express';
import Link from '../models/linkModel.js';
import NotFoundError from '../errors/NotFoundError.js';
import UnauthorizedError from '../errors/UnauthorizedError.js';
import { ioRedisClient } from '../cache/ioRedis.js';
const redis = ioRedisClient();

const handshakePage = (req: Request, res: Response) => {
  const { short_id } = req.params;
  res.send(`
    <form action="/verify" method="POST">
      <input type="hidden" name="short_id" value="${short_id}" />
      <label>Token do link:</label>
      <input name="token" required />
      <button type="submit">Abrir link</button>
    </form>
  `);
};

const verifyToken = async (req: Request, res: Response) => {
  const { short_id, token } = req.body;
  const userId = req.user?._id?.toString();

  const cacheKey = `handshake:${short_id}:${token}`;
  let url = await redis.get(cacheKey);

  if (!url) {
    const link = await Link.findOne({ shortUrl: short_id, token });
    if (!link) {
      throw new NotFoundError({ message: 'Link não encontrado' });
    }
    if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
      throw new UnauthorizedError({ message: 'Link expirado' });
    }
    if (link.criado_por && userId && link.criado_por.toString() !== userId) {
      throw new UnauthorizedError({ message: 'Não autorizado' });
    }
    url = link.originalUrl;
    await redis.set(cacheKey, url, 'EX', 60);
  }

  res.cookie(`auth_${short_id}`, token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 60000,
  });

  res.redirect(url);
};

export { handshakePage, verifyToken };
