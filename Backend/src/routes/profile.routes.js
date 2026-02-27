import express from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";
import { updateAvatar , updateProfile } from "../controllers/profile.controller.js";

const router = express.Router();

router.route("/avatar").patch(
  verifyJWT,
  upload.single("avatar"),
  updateAvatar
);

router.route("/update").patch(verifyJWT, updateProfile);

export default router