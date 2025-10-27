import { ErrorRequestHandler } from 'express';
import { CustomError } from '../errors/CustomError.js';

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (err instanceof CustomError) {
    const { statusCode, errors, logging } = err;

    if (logging) {
      console.error(`[${new Date().toISOString()}]`, {
        statusCode,
        errors,
        stack: err.stack?.split('\n')[1],
      });
    }

    res.status(statusCode).json({
      errors: errors.map(e => ({ message: e.message })),
    });
    return;
  }

  console.error('Erro não tratado:', err);
  res.status(500).json({
    errors: [{ message: 'Erro interno do servidor' }],
  });
};
