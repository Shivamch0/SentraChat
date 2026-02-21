import express from "express";
import { chats , groupChat , getChats, markMessagesSeen } from "../controllers/chat.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.route("/chat").post(verifyJWT , chats);

router.route("/group/chat").post(verifyJWT , groupChat);

router.route("/getChat").get( verifyJWT , getChats);

router.route("/mark-seen/:chatId").patch(verifyJWT, markMessagesSeen);

export default router;