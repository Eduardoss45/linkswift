import crypto from 'crypto';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import UserModel from '../models/userModel.js';
import { NextFunction, Request, Response } from 'express';
import { successResponse } from '../utils/response.js';
import { TokenPayload } from '../types/types.js';
import BadRequestError from '../errors/BadRequestError.js';
import { sendEmailToQueue } from '../queues/emailQueue.js';
import NotFoundError from '../errors/NotFoundError.js';
import UnauthorizedError from '../errors/UnauthorizedError.js';
import ForbiddenError from '../errors/ForbiddenError.js';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { nome, email, password, confirmPassword } = req.body;
    if (!nome || !email || !password || !confirmPassword) {
      throw new BadRequestError({
        message:
          'Verifique se os campos nome, email, password e confirmPassword foram preenchidos.',
      });
    }
    if (password !== confirmPassword) {
      throw new BadRequestError({ message: 'As senhas não coincidem.' });
    }

    const userExists = await UserModel.findOne({ email });
    if (userExists) throw new BadRequestError({ message: 'Email já cadastrado.' });

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

    await sendEmailToQueue({
      to: email,
      subject: 'Verifique seu e-mail',
      content: `Olá, ${nome}!\n\nSeu código de verificação é: ${verificationCode}`,
    });

    const refreshToken = jwt.sign({ userId: newUser._id.toString() }, process.env.REFRESH_SECRET!, {
      expiresIn: '30d',
    });

    newUser.refreshToken = refreshToken;
    await newUser.save();

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    successResponse(res, 201, 'Usuário cadastrado com sucesso!', {
      user: {
        _id: newUser._id,
        email: newUser.email,
        nome: newUser.nome,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const verificarCodigo = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, codigo } = req.body;
    if (!email || !codigo)
      throw new BadRequestError({ message: 'Email e código são obrigatórios.' });

    const user = await UserModel.findOne({ email });
    if (!user) throw new NotFoundError({ message: 'Usuário não encontrado.' });
    if (user.verificado) throw new BadRequestError({ message: 'Usuário já verificado.' });
    if (user.verificationCode !== codigo)
      throw new BadRequestError({ message: 'Código inválido.' });

    user.verificado = true;
    user.verificationCode = undefined;
    await user.save();

    successResponse(res, 200, 'E-mail verificado com sucesso!');
  } catch (error) {
    next(error);
  }
};

export const reenviarCodigo = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    if (!email) throw new BadRequestError({ message: 'Email é obrigatório.' });

    const user = await UserModel.findOne({ email });
    if (!user) throw new NotFoundError({ message: 'Usuário não encontrado.' });

    const verificationCode = crypto.randomBytes(3).toString('hex').toUpperCase();
    user.verificationCode = verificationCode;
    await user.save();

    await sendEmailToQueue({
      to: email,
      subject: 'Verifique seu e-mail',
      content: `Olá, ${user.nome}!\n\nSeu novo código de verificação é: ${verificationCode}`,
    });

    successResponse(res, 200, 'Código de verificação reenviado com sucesso.');
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      throw new BadRequestError({
        message: 'Verifique se os campos email e password foram preenchidos.',
      });

    const user = await UserModel.findOne({ email });
    if (!user) throw new NotFoundError({ message: 'Usuário não encontrado.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new UnauthorizedError({ message: 'Senha incorreta.' });

    const accessToken = jwt.sign({ userId: user._id.toString() }, process.env.JWT_SECRET!, {
      expiresIn: '15m',
    });

    const refreshToken = jwt.sign({ userId: user._id.toString() }, process.env.REFRESH_SECRET!, {
      expiresIn: '30d',
    });

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
      path: '/refresh-token',
    });

    successResponse(res, 200, 'Login bem-sucedido.', {
      accessToken,
      user: {
        _id: user._id,
        email: user.email,
        nome: user.nome,
        verificado: user.verificado,
        links: user.links || [],
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken)
      throw new UnauthorizedError({ message: 'Token de atualização não fornecido.' });

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET || '') as TokenPayload;
    if (!decoded || !decoded.userId)
      throw new ForbiddenError({ message: 'Token inválido ou expirado.' });

    const user = await UserModel.findById(decoded.userId);
    if (!user || user.refreshToken !== refreshToken)
      throw new ForbiddenError({ message: 'Token inválido.' });

    const newAccessToken = jwt.sign({ userId: user._id.toString() }, process.env.JWT_SECRET || '', {
      expiresIn: '15m',
    });

    successResponse(res, 200, 'Token atualizado com sucesso.', {
      accessToken: newAccessToken,
      user: {
        _id: user._id,
        email: user.email,
        nome: user.nome,
        verificado: user.verificado,
        links: user.links || [],
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken)
      throw new UnauthorizedError({ message: 'Token de atualização não fornecido.' });

    const user = await UserModel.findOne({ refreshToken });
    if (!user) throw new NotFoundError({ message: 'Token inválido.' });

    user.refreshToken = null;
    await user.save();

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    successResponse(res, 200, 'Logout realizado com sucesso.');
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    if (!email) throw new BadRequestError({ message: 'Email é obrigatório.' });

    const user = await UserModel.findOne({ email });
    if (!user) throw new NotFoundError({ message: 'Usuário não encontrado.' });

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

    if (process.env.NODE_ENV !== 'production') console.log(`[Reset Link]: ${resetLink}`);

    await sendEmailToQueue({
      to: email,
      subject: 'Redefinição de senha - Link de acesso',
      content: htmlContent,
      options: { isHtml: true },
    });

    successResponse(res, 200, 'Redefinição de senha solicitada com sucesso.');
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.params;
    const { newPassword, confirmNewPassword } = req.body;

    if (!token || !newPassword || !confirmNewPassword)
      throw new BadRequestError({ message: 'Todos os campos são obrigatórios.' });
    if (newPassword !== confirmNewPassword)
      throw new BadRequestError({ message: 'As senhas não coincidem.' });

    const user = await UserModel.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) throw new BadRequestError({ message: 'Token inválido ou expirado' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    await sendEmailToQueue({
      to: user.email,
      subject: 'Senha redefinida com sucesso',
      content: `Olá, ${user.nome}, sua senha foi alterada com sucesso.`,
    });

    successResponse(res, 200, 'Senha redefinida com sucesso.');
  } catch (error) {
    next(error);
  }
};
