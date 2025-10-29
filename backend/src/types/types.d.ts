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

export interface UserDocument extends Document {
  _id: Types.ObjectId;
  nome: string;
  email: string;
  password: string;
  links: (Types.ObjectId | LinkDocument)[];
  refreshToken?: string | null;
  createdAt: Date;
  verificado: boolean;
  verificationCode?: string;
  resetPasswordToken?: string | null;
  resetPasswordExpires?: Date | null;
}

export interface BaseLinkData {
  url: string;
  key: string;
  senha: string | null;
  privado: boolean;
  expira_em: string | null;
  nome?: string | null;
}

export interface RedisLinkData extends BaseLinkData {
  _id: Types.ObjectId;
}

export interface LinkData extends BaseLinkData {
  _id: Types.ObjectId;
  criado_por?: Types.ObjectId | UserDocument | null;
  criado_em: Date;
}

export interface LinkDocument extends Document, BaseLinkData {
  _id: Types.ObjectId;
  originalUrl: string;
  expiresAt?: Date | null;
  criado_por: Types.ObjectId | UserDocument | null;
  analytics: {
    total_clicks: number;
    clicks_por_dia: { data: string; quantidade: number }[];
    ultimos_ips: string[];
  };
  criado_em: Date;
}

