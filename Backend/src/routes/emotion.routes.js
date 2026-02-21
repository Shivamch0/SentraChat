import express from "express";;
import { detectEmotion } from "../controllers/emotion.controller.js";

const router = express.Router();

router.route("/detect").post(detectEmotion);

export default router;
