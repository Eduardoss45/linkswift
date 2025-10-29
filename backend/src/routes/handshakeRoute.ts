import { Router } from 'express';
import { handshakePage, verifyToken } from '../controllers/handshakeController.js';
import { optionalAuthenticateToken } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/open/:short_id', handshakePage);
router.post('/verify', optionalAuthenticateToken, verifyToken);

export default router;
