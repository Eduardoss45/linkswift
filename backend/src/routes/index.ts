import { Router } from 'express';
import user from './user.js';
import link from './link.js';

const router = Router();
router.use(user);
router.use(link);

export default router;