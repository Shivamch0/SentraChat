import express from "express";
import { registerUser , loginUser , logoutUser , refreshAccessToken  } from "../controllers/user.controller.js";

const router = express.Router();

router.route("/register").post(registerUser);

router.route("/login").post(loginUser);

router.route("/logout").post(logoutUser);

router.route("/refrehToken").post(refreshAccessToken);

export default router;