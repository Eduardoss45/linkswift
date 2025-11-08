import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import { ioRedisClient } from '../cache/ioRedis.js';
import LinkModel from '../models/linkModel.js';

const redis = ioRedisClient();

export const redirectProtectedLink = async (req: Request, res: Response) => {
  const { key } = req.params;
  const { senha } = req.query as { senha?: string };

  let data = await redis.get(key);
  if (!data) {
    const dbLink = await LinkModel.findOne({ key });
    if (!dbLink) {
      res.status(404).json({ message: 'Link não encontrado.' });
      return;
    }
    await redis.set(key, JSON.stringify(dbLink), 'EX', 3600);
    data = JSON.stringify(dbLink);
  }

  const link = JSON.parse(data);

  if (!link.senha) {
    res.status(400).json({ message: 'Este link não requer senha.' });
    return;
  }

  if (!senha) {
    res.status(400).json({ message: 'Senha obrigatória para acesso.' });
    return;
  }

  const senhaValida = await bcrypt.compare(senha, link.senha);

  if (!senhaValida) {
    res.status(401).json({ message: 'Senha incorreta.' });
    return;
  }

  res.redirect(link.url);
};
