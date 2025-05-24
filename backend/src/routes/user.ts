import express from 'express';
import {
  register,
  login,
  refreshToken,
  logout,
  verificarCodigo,
} from '../controllers/authController.js';

const router = express.Router();

router.post('/register', register);
router.post('/verify-email', verificarCodigo);
router.post('/login', login);
router.post('/refresh-token', refreshToken);
router.post('/logout', logout);

export default router;
