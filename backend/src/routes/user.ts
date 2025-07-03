import express from 'express';
import {
  register,
  login,
  refreshToken,
  logout,
  verificarCodigo,
  reenviarCodigo
} from '../controllers/authController.js';

const router = express.Router();

router.post('/register', register);
router.post('/verify-email', verificarCodigo);
router.post('/login', login);
router.post('/refresh-token', refreshToken);
router.post('/resend-verify-code', reenviarCodigo);
router.post('/logout', logout);

export default router;
