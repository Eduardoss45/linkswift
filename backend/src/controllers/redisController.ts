import { ioRedisClient } from '../cache/ioRedis.js';
import { Request, Response, NextFunction } from 'express';
import { successResponse } from '../utils/response.js';
const redis = ioRedisClient();

export const getAllData = async (req: Request, res: Response) => {
  try {
    const chaves = await redis.keys('*');
    const data: Record<string, string | null> = {};

    for (const chave of chaves) {
      const valor = await redis.get(chave);
      data[chave] = valor;
    }
    
    return successResponse(res, 200, 'Dados do Redis encontrados', data);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar dados do Redis' });
  }
};

export const deleteAllData = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const chaves = await redis.keys('*');

    if (chaves.length === 0) {
      return successResponse(res, 200, 'Nenhuma chave encontrada no Redis.');
    }

    await redis.del(...chaves);

    return successResponse(res, 200, 'Todos os dados foram deletados do Redis com sucesso.', {
      totalDeletadas: chaves.length,
    });
  } catch (err) {
    console.error('Erro ao deletar dados do Redis:', err);
    next(err);
  }
};
