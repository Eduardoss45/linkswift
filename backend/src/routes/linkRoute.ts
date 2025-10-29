import { Router } from 'express';
import { shortenLinks, checkLink, redirectToLinks } from '../controllers/linkController.js';
import { redirectPrivateLink, redirectPrivateLinkWithCookie } from '../controllers/linkPrivateController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = Router();

router.post('/links', authenticateToken, shortenLinks);
router.get('/links/:key', authenticateToken, checkLink);
router.get('/r/:key', redirectToLinks);
router.get('/private/:key', authenticateToken, redirectPrivateLink);
router.get('/redirect/:short_id', redirectPrivateLinkWithCookie);

export default router;
