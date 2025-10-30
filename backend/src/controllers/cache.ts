import { ioRedisClient } from '../cache/ioRedis.js';
import { Request, Response } from 'express';
const redis = ioRedisClient();

export const fetchAllData = async (req: Request, res: Response) => {
  try {
    const chaves = await redis.keys('*');
    const data: Record<string, string | null> = {};

    for (const chave of chaves) {
      const valor = await redis.get(chave);
      data[chave] = valor;
    }

    res.status(200).json({ data });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar dados do Redis' });
  }
};
