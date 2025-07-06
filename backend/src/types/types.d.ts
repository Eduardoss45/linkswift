import { Document, Types } from 'mongoose';

declare global {
  namespace Express {
    interface Request {
      user?: UserDocument;
    }
  }
}

export interface TokenPayload {
  userId: string;
}

export interface LinkData {
  _id?: string | null; // * ID do criador (MongoDB)
  url: string; // * URL de destino
  exclusive?: boolean; // * Acesso apenas do criador
  password: string | null; // * Senha criptografada
  nome?: string | null; // * Nome do link (opcional)
}

export interface UserDocument extends Document {
  _id: Types.ObjectId;
  nome: string;
  email: string;
  password: string;
  links: string[];
  refreshToken?: string | null;
  createdAt: Date;
  verificado: boolean;
  verificationCode?: string;
  resetPasswordToken?: string | null;
  resetPasswordExpires?: Date | null;
}
