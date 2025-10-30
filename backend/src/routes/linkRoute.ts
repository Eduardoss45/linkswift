import { Router } from 'express';
import {
  shortenLinks,
  checkLink,
  redirectToLinks,
  handshakeVerify,
} from '../controllers/linkController.js';
import {
  redirectPrivateLink,
  redirectPrivateLinkWithCookie,
} from '../controllers/linkPrivateController.js';
import { redirectProtectedLink } from '../controllers/linkProtectedController.js';
import { authenticateToken, optionalAuthenticateToken } from '../middlewares/authMiddleware.js';
import { deleteAllData, getAllData } from '../controllers/redisController.js';

const router = Router();

router.post('/links', authenticateToken, shortenLinks);
router.get('/links/:key', optionalAuthenticateToken, checkLink);
router.get('/protected/:key', redirectProtectedLink);
router.get('/r/:key', redirectToLinks);
router.get('/get', getAllData);
router.get('/delete', deleteAllData);
router.get('/private/:key', authenticateToken, redirectPrivateLink);
router.get('/redirect/:short_id', redirectPrivateLinkWithCookie);
router.post('/handshake/verify', handshakeVerify);

export default router;
