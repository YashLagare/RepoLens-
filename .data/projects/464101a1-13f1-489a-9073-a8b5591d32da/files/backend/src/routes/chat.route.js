import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getStreamToken, summarizeChannel } from "../middleware/chat.controller.js";

const router = express.Router();

router.get("/token", protectRoute, getStreamToken);
router.post("/summarize", protectRoute, summarizeChannel);

export default router;
