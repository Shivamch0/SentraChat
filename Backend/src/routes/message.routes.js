import express from "express";;
import { sendMessage , getMessage } from "../controllers/message.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.route("/sendMessage").post( verifyJWT , sendMessage);

router.route(".getMessage").get(getMessage)

export default router;