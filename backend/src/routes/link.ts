import express from "express";
const router = express.Router();
import {
  shortenLinks,
  listAllLinks,
  updateLinks,
  deleteLinks,
  redirectToLinks,
  helloLinkSwift
} from "../controllers/linkController.js";
import { authenticateToken, optionalAuthenticateToken } from "../middleware/authMiddleware.js";

// * Autenticada
router.put("/links/:id", authenticateToken, updateLinks);
router.delete("/links/:id", authenticateToken, deleteLinks);
router.get("/links", authenticateToken, listAllLinks);

// * Publica
router.get("/", helloLinkSwift);
router.post("/shorten", optionalAuthenticateToken, shortenLinks);
router.get("/:id", optionalAuthenticateToken, redirectToLinks);


export default router;
