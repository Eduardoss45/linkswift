import { Response } from 'express';

export function successResponse<T>(
  res: Response,
  statusCode: number,
  message: string,
  payload?: T
) {
  res.status(statusCode).json(payload ? { message, ...payload } : { message });
}
