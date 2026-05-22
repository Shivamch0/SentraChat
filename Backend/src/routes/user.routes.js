import express from "express";
import { registerUser , loginUser , logoutUser , refreshAccessToken , getCurrentUser, searchUsers } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.route("/register").post(registerUser);

router.route("/login").post(loginUser);

router.route("/logout").post(verifyJWT , logoutUser);

router.route("/refreshToken").post(refreshAccessToken);

router.route("/current-user").get(verifyJWT , getCurrentUser);

router.route("/search").get(verifyJWT , searchUsers);

export default router;