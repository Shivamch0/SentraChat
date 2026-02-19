import express from "express";
import { chats , groupChat } from "../controllers/chat.controller.js";

const router = express.Router();

router.route("/chat").post(chats);

router.route("/group/chat").post(groupChat);

router.route("/getChat").get(getChats);

export default router;