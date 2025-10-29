import { Router } from 'express';
import user from './userRoute.js';
import link from './linkRoute.js';
import handshake from './handshakeRoute.js';

const router = Router();
router.use(user);
router.use(link);
router.use(handshake);

export default router;