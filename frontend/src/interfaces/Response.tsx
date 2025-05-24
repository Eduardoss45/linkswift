export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface ApiResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: { id: string; name: string; email: string };
}

export interface ApiResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: { id: string; name: string; email: string };
}

export interface ErrorResponse {
  message: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  links: string[];
  verificado: boolean;
  createdAt: string;
  verificationCode?: string;
}
