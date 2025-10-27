import express from 'express';
const router = express.Router();
import {
  shortenLinks,
  // listAllLinks,
  // updateLinks,
  // deleteLinks,
  checkLink,
  redirectToLinks,
  helloLinkSwift,
} from '../controllers/linkController.js';
import { authenticateToken, optionalAuthenticateToken } from '../middlewares/authMiddleware.js';

// * Autenticada
// router.put("/links/:id", authenticateToken, updateLinks);
// router.delete("/links/:id", authenticateToken, deleteLinks);
// router.get("/links", authenticateToken, listAllLinks);

// * Publica
router.get('/', helloLinkSwift);
router.post('/shorten', optionalAuthenticateToken, shortenLinks);
router.get('/check/:key', optionalAuthenticateToken, checkLink);
// router.post(
//   '/:key',
//   optionalAuthenticateToken,
//   () => {
//     console.log('rota recebe algo');
//   },
//   redirectToLinks
// );
router.get('/:key', optionalAuthenticateToken, redirectToLinks);
router.post('/:key', optionalAuthenticateToken, redirectToLinks);

export default router;
