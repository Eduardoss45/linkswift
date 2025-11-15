import { Router } from 'express';
import {
  shortenLinks,
  checkLink,
  redirectToLinks,
  deleteLink,
} from '../controllers/linkController.js';
import { redirectPrivateLink } from '../controllers/linkPrivateController.js';
import { redirectProtectedLink } from '../controllers/linkProtectedController.js';
import { deleteAllData, getAllData } from '../controllers/redisController.js';

const router = Router();

router.post('/links', shortenLinks);
router.delete('/links/:key', deleteLink);

router.get('/check/:key', checkLink);

router.get('/r/:key', redirectToLinks);
router.post('/private/:key', redirectPrivateLink);
router.get('/protected/:key', redirectProtectedLink);
router.get('/get', getAllData);
router.get('/delete', deleteAllData);

export default router;
