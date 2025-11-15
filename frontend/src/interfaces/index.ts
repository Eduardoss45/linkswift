export interface RegisterData {
  nome: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface ApiResponse {
  message?: string;
  accessToken?: string;
  user?: {
    _id: string;
    nome: string;
    email: string;
    verificado: boolean;
    links: [];
    createdAt: string;
  };
}

export interface ErrorResponse {
  message?: string;
}

export interface User {
  _id: string;
  nome: string;
  email: string;
  links: string[];
  verificado: boolean;
  createdAt: string;
  verificationCode?: string;
  logado?: boolean;
}

export interface ShortenLinkData {
  url: string;
  senha: string;
  nome: string;
  privado: boolean;
  expira_em?: string;
}

export interface CheckLinkResponse {
  message: string;
  privado: boolean;
  senhaNecessaria: boolean;
  url: string | null;
}

export interface Link {
  _id: string;
  url: string;
  key: string;
  nome: string | null;
  privado: boolean;
  expira_em: string;
  criado_em: string;
  analytics: {
    total_clicks: number;
    clicks_por_dia: {
      data: string;
      quantidade: number;
    }[];
  };
}
