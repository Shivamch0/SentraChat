import express from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";
import { updateAvatar } from "../controllers/profile.controller.js";

const router = express.Router();

router.patch(
  "/avatar",
  verifyJWT,
  upload.single("avatar"),
  updateAvatar
);

export default router