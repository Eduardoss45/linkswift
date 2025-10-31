import express from 'express';
import {
  register,
  login,
  refreshToken,
  logout,
  verificarCodigo,
  reenviarCodigo,
  forgotPassword,
  resetPassword,
} from '../controllers/userController.js';

const router = express.Router();

router.post('/register', register);
router.post('/verify-email', verificarCodigo);
router.post('/login', login);
router.post('/refresh-token', refreshToken);
router.post('/resend-verify-code', reenviarCodigo);
router.post('/password-reset-request', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.post('/refresh-token/logout', logout);

export default router;
