import { CustomError } from './CustomError.js';

export default class ForbiddenError extends CustomError {
  private static readonly _statusCode = 403;
  private readonly _code: number;
  private readonly _logging: boolean;
  private readonly _context: { [key: string]: any };

  constructor(params?: {
    code?: number;
    message?: string;
    logging?: boolean;
    context?: { [key: string]: any };
  }) {
    super(params?.message || 'Acesso negado');

    this._code = params?.code ?? ForbiddenError._statusCode;
    this._logging = params?.logging ?? false;
    this._context = params?.context ?? {};

    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }

  get errors() {
    return [{ message: this.message, context: this._context }];
  }

  get statusCode() {
    return this._code;
  }

  get logging() {
    return this._logging;
  }
}
