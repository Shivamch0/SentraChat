import { analyzeEmotion } from "../services/emotion.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const detectEmotion = async (req, res) => {
  const { message } = req.body;

  console.log("Emotion API received:", message);

  const emotion = await analyzeEmotion(message);

  console.log("Detected emotion:", emotion);

  return res.status(200).json(
    new ApiResponse(200, { emotion }, "Emotion detect successfully")
  );
};