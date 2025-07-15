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
  success?: boolean;
  message?: string;
  token?: string;
  user?: { id: string; nome: string; email: string };
  url?: string;
  senhaNecessaria?: boolean;
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
}

export interface AuthContextType {
  user: {
    id: string;
    email: string;
    nome: string;
    verificado: boolean;
    logado: boolean;
  };
}

export interface ShortenLinkData {
  url: string;
  senha: string;
  nome: string;
  privado: boolean;
  expira_em?: string;
}
