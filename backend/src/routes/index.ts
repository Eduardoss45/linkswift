import { Router } from 'express';
import user from './userRoute.js';
import link from './linkRoute.js';

const router = Router();
router.use(user);
router.use(link);

export default router;