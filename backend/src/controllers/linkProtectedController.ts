import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import { ioRedisClient } from '../cache/ioRedis.js';
import LinkModel from '../models/linkModel.js';

const redis = ioRedisClient();

export const redirectProtectedLink = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
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

    const ip = req.ip ?? '0.0.0.0';
    const redisKey = `link:${key}:ip:${ip}`;

    if (await redis.get(redisKey)) {
      res.redirect(link.url);
      return;
    }

    await redis.set(redisKey, '1', 'EX', 5);

    const hoje = new Date().toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });

    const dbLink = await LinkModel.findOne({ key });
    if (dbLink) {
      const analytics = dbLink.analytics;
      analytics.total_clicks++;

      const clicksPorDia = Array.isArray(analytics.clicks_por_dia) ? analytics.clicks_por_dia : [];

      const diaExistente = clicksPorDia.find(d => d.data === hoje);
      if (diaExistente) diaExistente.quantidade++;
      else clicksPorDia.push({ data: hoje, quantidade: 1 });

      analytics.clicks_por_dia = clicksPorDia;

      analytics.ultimos_ips.push(ip);
      if (analytics.ultimos_ips.length > 10) {
        analytics.ultimos_ips = analytics.ultimos_ips.slice(-10);
      }

      await dbLink.save();
    }

    res.redirect(link.url);
  } catch (err) {
    next(err);
  }
};
