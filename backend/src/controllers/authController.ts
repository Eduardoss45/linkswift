import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { sendSuccessResponse, sendErrorResponse } from '../utils/helpers.js';
import { TokenPayload } from '../types/types.js';
import UserModel from '../models/User.js';
import crypto from 'crypto';
import { enviarEmail } from '../config/email.js';

if (!process.env.JWT_SECRET || !process.env.REFRESH_SECRET) {
  throw new Error('Segredos JWT não definidos no .env');
}

// * Registro
export const register = async (req: Request, res: Response) => {
  const { name, email, password, confirmPassword } = req.body;
  if (!name || !email || !password || !confirmPassword) {
    sendErrorResponse(
      res,
      400,
      'Verifique se os campos name, email, password e confirmPassword foram preenchidos.'
    );
    return;
  } else if (password !== confirmPassword) {
    sendErrorResponse(res, 400, 'As senhas não coincidem.');
    return;
  }
  try {
    const userExists = await UserModel.findOne({ email });
    if (userExists) {
      sendErrorResponse(res, 400, 'Email já cadastrado.');
      return;
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationCode = crypto.randomBytes(3).toString('hex');
    const newUser = new UserModel({
      name,
      email,
      password: hashedPassword,
      verificado: false,
      verificationCode,
    });
    await newUser.save();
    await enviarEmail(
      email,
      'Verifique seu e-mail',
      `Olá, ${name}!\n\nSeu código de verificação é: ${verificationCode}`
    );
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    sendSuccessResponse(res, 201, 'Usuário cadastrado com sucesso!', {
      user: {
        id: newUser._id,
        email: newUser.email,
        name: newUser.name,
      },
    });
  } catch (error) {
    console.error('Erro no register:', error);
    sendErrorResponse(res, 500, 'Erro ao cadastrar usuário.');
  }
};

// * Verificar email
export const verificarCodigo = async (req: Request, res: Response) => {
  const { email, codigo } = req.body;
  if (!email || !codigo) {
    return sendErrorResponse(res, 400, 'Email e código são obrigatórios.');
  }
  try {
    const user = await UserModel.findOne({ email });
    if (!user) {
      return sendErrorResponse(res, 404, 'Usuário não encontrado.');
    }
    if (user.verificado) {
      return sendErrorResponse(res, 400, 'Usuário já verificado.');
    }
    if (user.verificationCode !== codigo) {
      return sendErrorResponse(res, 400, 'Código inválido.');
    }
    user.verificado = true;
    user.verificationCode = undefined;
    await user.save();
    return sendSuccessResponse(res, 200, 'E-mail verificado com sucesso!');
  } catch (error) {
    console.error('Erro na verificação de e-mail:', error);
    return sendErrorResponse(res, 500, 'Erro interno ao verificar e-mail.');
  }
};

// * Login
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  console.log(email, password);
  if (!email || !password) {
    sendErrorResponse(res, 400, 'Verifique se os campos email e password foram preenchidos.');
  }
  try {
    const user = await UserModel.findOne({ email });
    if (!user) {
      sendErrorResponse(res, 400, 'Usuário não encontrado.');
      return;
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      sendErrorResponse(res, 401, 'Senha incorreta.');
      return;
    }
    const token = jwt.sign({ userId: user._id.toString() }, process.env.JWT_SECRET!, {
      expiresIn: '24h',
    });
    const newRefreshToken = jwt.sign({ userId: user._id.toString() }, process.env.REFRESH_SECRET!, {
      expiresIn: '30d',
    });
    user.refreshToken = newRefreshToken;
    await user.save();
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    sendSuccessResponse(res, 200, 'Login bem-sucedido.', {
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    sendErrorResponse(res, 500, 'Erro ao fazer login.');
  }
};

// * RefresToken
export const refreshToken = async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return sendErrorResponse(res, 401, 'Token de atualização não fornecido.');
  }
  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET || '') as TokenPayload;
    if (!decoded || !decoded.userId) {
      sendErrorResponse(res, 403, 'Token inválido ou expirado.');
      return;
    }
    const user = await UserModel.findById(decoded.userId);
    if (!user || user.refreshToken !== refreshToken) {
      sendErrorResponse(res, 403, 'Token inválido.');
      return;
    }
    const newAccessToken = jwt.sign({ userId: user._id.toString() }, process.env.JWT_SECRET || '', {
      expiresIn: '1h',
    });
    sendSuccessResponse(res, 200, 'Token atualizado com sucesso.', {
      token: newAccessToken,
    });
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      return sendErrorResponse(res, 403, 'Token expirado.');
    }
    return sendErrorResponse(res, 403, 'Token inválido.');
  }
};

// * Logout
export const logout = async (req: Request, res: Response) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) {
    sendErrorResponse(res, 401, 'Token de atualização não fornecido.');
    return;
  }
  try {
    const user = await UserModel.findOne({ refreshToken });
    if (!user) {
      sendErrorResponse(res, 404, 'Token inválido.');
      return;
    }
    user.refreshToken = null;
    await user.save();
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    sendSuccessResponse(res, 200, 'Logout realizado com sucesso.');
  } catch (error) {
    sendErrorResponse(res, 500, 'Erro ao fazer logout.');
  }
};
