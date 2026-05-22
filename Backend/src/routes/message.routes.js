import express from "express";
import {
  sendMessage,
  getMessage,
  sendMediaMessage,
  editMessage,
  deleteMessage,
  reactToMessage,
  searchMessages,
  getNotifications
} from "../controllers/message.controller.js";
import { upload  } from "../middlewares/upload.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.route("/sendMessage").post(verifyJWT, sendMessage);

router.route("/sendMedia").post( verifyJWT, upload.single("media"), sendMediaMessage);

router.route("/notifications").get(verifyJWT , getNotifications);

router.route("/:chatId").get(verifyJWT, getMessage);

router.route("/edit/:messageId").patch(verifyJWT, editMessage);

router.route("/delete/:messageId").delete(verifyJWT, deleteMessage);

router.route("/react/:messageId").post(verifyJWT, reactToMessage);

router.route("/search/:chatId").get(verifyJWT , searchMessages);

export default router;
