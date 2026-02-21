import express from "express";
import {
  sendMessage,
  getMessage,
  sendMediaMessage,
} from "../controllers/message.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.route("/sendMessage").post(verifyJWT, sendMessage);

router.post("/sendMedia", verifyJWT, upload.single("media"), sendMediaMessage);

router.route("/:chatId").get(verifyJWT, getMessage);

export default router;
