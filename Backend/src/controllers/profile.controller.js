import { User } from "../models/user.models.js";
import cloudinary from "../config/cloudinary.js";

export const updateAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const upload = await cloudinary.uploader.upload(req.file.path, {
      folder: "avatars",
    });

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: upload.secure_url },
      { new: true }
    ).select("-password -refreshToken");

    return res.status(200).json({
      message: "Avatar updated",
      user: updatedUser
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Upload failed" });
  }
};

export const updateProfile = async (req, res) => {
  const { fullName, about, avatar } = req.body;

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    { fullName, about, avatar },
    { new: true }
  ).select("-password -refreshToken");

  return res.status(200).json({
    message: "Profile updated",
    user: updatedUser
  });
};