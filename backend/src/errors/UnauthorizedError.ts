import { CustomError } from './CustomError.js';

export default class UnauthorizedError extends CustomError {
  private static readonly _statusCode = 401;
  private readonly _context: { [key: string]: any };
  private readonly _logging: boolean;

  constructor(params?: { message?: string; context?: any; logging?: boolean }) {
    super(params?.message || 'Não autorizado');
    this._context = params?.context || {};
    this._logging = params?.logging || false;
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }

  get statusCode() {
    return UnauthorizedError._statusCode;
  }

  get errors() {
    return [{ message: this.message, context: this._context }];
  }

  get logging() {
    return this._logging;
  }
}
