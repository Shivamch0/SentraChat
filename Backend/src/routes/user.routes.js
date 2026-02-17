import express from "express";
import { registerUser , loginUser , logoutUser , refreshAccessToken , getCurrentUser } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.route("/register").post(registerUser);

router.route("/login").post(loginUser);

router.route("/logout").post(logoutUser);

router.route("/refreshToken").post(refreshAccessToken);

router.route("/currentUser").get(verifyJWT , getCurrentUser)

export default router;