import { Router } from 'express';
import { shortenLinks, checkLink, redirectToLinks } from '../controllers/linkController.js';
import {
  redirectPrivateLink,
  redirectPrivateLinkWithCookie,
} from '../controllers/linkPrivateController.js';
import { redirectProtectedLink } from '../controllers/linkProtectedController.js';
import { authenticateToken, optionalAuthenticateToken } from '../middlewares/authMiddleware.js';
import { fetchAllData } from '../controllers/cache.js';

const router = Router();

router.post('/links', authenticateToken, shortenLinks);
router.get('/links/:key', optionalAuthenticateToken, checkLink);
router.get('/protected/:key', redirectProtectedLink);
router.get('/r/:key', redirectToLinks);
router.get('/all', fetchAllData);
router.get('/private/:key', authenticateToken, redirectPrivateLink);
router.get('/redirect/:short_id', redirectPrivateLinkWithCookie);

export default router;
