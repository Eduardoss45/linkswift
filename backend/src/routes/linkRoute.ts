import express from 'express';
import { redirectPublicLink } from '../controllers/linkPublicController.js';
import { redirectProtectedLink } from '../controllers/linkProtectedController.js';
import { redirectPrivateLink } from '../controllers/linkPrivateController.js';
import { authenticateToken, optionalAuthenticateToken } from '../middlewares/authMiddleware.js';
import { shortenLinks, checkLink, helloLinkSwift } from '../controllers/linkController.js';

const router = express.Router();

/**
 * 🔓 1️⃣ Link Público
 * - Não requer autenticação nem senha
 */
router.get('/public/:key', redirectPublicLink);

/**
 * 🔐 2️⃣ Link Protegido (com senha)
 * - Senha enviada via query (?senha=123) ou formulário
 */
router.get(
  '/protected/:key',
  () => {
    console.log('foi para o controller.');
  },
  redirectProtectedLink
);

/**
 * 🔒 3️⃣ Link Privado (exclusivo do dono)
 * - Requer usuário logado (middleware verifica JWT)
 */
router.get('/private/:key', authenticateToken, redirectPrivateLink);

// * Publica
router.get('/', helloLinkSwift);
router.post('/shorten', optionalAuthenticateToken, shortenLinks);
router.get('/check/:key', optionalAuthenticateToken, checkLink);

export default router;
