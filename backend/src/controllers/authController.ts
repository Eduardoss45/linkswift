import crypto from 'crypto';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import UserModel from '../models/User.js';
import { sendEmail } from '../email/email.js';
import { Request, Response } from 'express';
import { sendSuccessResponse, sendErrorResponse } from '../utils/helpers.js';
import { TokenPayload } from '../types/types.js';

export const register = async (req: Request, res: Response) => {
  const { nome, email, password, confirmPassword } = req.body;
  if (!nome || !email || !password || !confirmPassword) {
    sendErrorResponse(
      res,
      400,
      'Verifique se os campos nome, email, password e confirmPassword foram preenchidos.'
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
    const verificationCode = crypto.randomBytes(3).toString('hex').toUpperCase();
    const newUser = new UserModel({
      nome,
      email,
      password: hashedPassword,
      verificado: false,
      verificationCode,
    });
    await newUser.save();
    await sendEmail({
      to: email,
      subject: 'Verifique seu e-mail',
      content: `Olá, ${nome}!\n\nSeu código de verificação é: ${verificationCode}`,
    });
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
        nome: newUser.nome,
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

// * Reenviar código de verificação
export const reenviarCodigo = async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    sendErrorResponse(res, 400, 'Email é obrigatório.');
    return;
  }

  try {
    const user = await UserModel.findOne({ email });

    if (!user) {
      sendErrorResponse(res, 404, 'Usuário não encontrado.');
      return;
    }

    const verificationCode = crypto.randomBytes(3).toString('hex').toUpperCase();

    user.verificationCode = verificationCode;
    await user.save();
    await sendEmail({
      to: email,
      subject: 'Verifique seu e-mail',
      content: `Olá, ${user.nome}!\n\nSeu novo código de verificação é: ${verificationCode}`,
    });
    sendSuccessResponse(res, 200, 'Código de verificação reenviado com sucesso.');
    return;
  } catch (error) {
    console.error(error);
    sendErrorResponse(res, 500, 'Erro interno do servidor.');
    return;
  }
};

// * Login
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
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
        nome: user.nome,
        verificado: user.verificado,
      },
    });
  } catch (error) {
    sendErrorResponse(res, 500, 'Erro ao fazer login.');
  }
};

// * Atualizar token
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
      user: {
        id: user._id,
        email: user.email,
        nome: user.nome,
        verificado: user.verificado,
      },
    });
  } catch (error: any) {
    if (error.nome === 'TokenExpiredError') {
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

// * Esqueci a senha
export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    sendErrorResponse(res, 400, 'Email é obrigatório.');
    return;
  }

  try {
    const user = await UserModel.findOne({ email });

    if (!user) {
      sendErrorResponse(res, 404, 'Usuário não encontrado.');
      return;
    }

    const token = crypto
      .createHash('sha256')
      .update(`${user._id}${Date.now()}${crypto.randomBytes(20).toString('hex')}`)
      .digest('hex');

    user.resetPasswordToken = token;
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();
    const resetLink = `${process.env.BASE_URL_FRONTEND}${process.env.RESET_PASS}${token}`;
    const htmlContent = `
  <p>Olá, ${user.nome}!</p>
  <p>Para redefinir sua senha, clique no link abaixo:</p>
  <p><a href="${resetLink}">LinkSwift - Redefinir Senha</a></p>
  <p>Se você não solicitou essa alteração, ignore este e-mail.</p>
`;

    if (process.env.NODE_ENV !== 'production') {
      console.log(`[Reset Link]: ${resetLink}`);
    }

    await sendEmail({
      to: email,
      subject: 'Redefinição de senha - Link de acesso',
      content: htmlContent,
      options: { isHtml: true },
    });
    sendSuccessResponse(res, 200, 'Redefinição de senha solicitada com sucesso.');
    return;
  } catch (error) {
    console.error(error);
    sendErrorResponse(res, 500, 'Erro interno do servidor.');
    return;
  }
};

// * Redefinir senha
export const resetPassword = async (req: Request, res: Response) => {
  const { token } = req.params;
  const { newPassword, confirmNewPassword } = req.body;

  if (!token || !newPassword || !confirmNewPassword) {
    sendErrorResponse(res, 400, 'Todos os campos são obrigatórios.');
    return;
  }

  if (newPassword !== confirmNewPassword) {
    sendErrorResponse(res, 400, 'As senhas não coincidem.');
    return;
  }

  const user = await UserModel.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: new Date() },
  });

  if (!user) {
    throw new Error('Token inválido ou expirado');
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  user.password = hashedPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;

  await user.save();
  await sendEmail({
    to: user.email,
    subject: 'Senha redefinida com sucesso',
    content: `Olá, ${user.nome}, sua senha foi alterada com sucesso.`,
  });

  sendSuccessResponse(res, 200, 'Senha redefinida com sucesso.');
};
