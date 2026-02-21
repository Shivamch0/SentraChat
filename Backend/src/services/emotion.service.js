import dotenv from "dotenv";
import fetch from "node-fetch";
dotenv.config({
  path: ".env",
});

const HUGGING_FACE_TOKEN = process.env.HUGGING_FACE_API_KEY;

export const analyzeEmotion = async (text) => {
  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/cardiffnlp/twitter-roberta-base-sentiment",
      {
        method: "POST",
        headers: {
          authorization: `Bearer ${HUGGING_FACE_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: text }),
      },
    );

    const result = await response.json();

    if (!Array.isArray(result) || !result[0]) {
      return "neutral";
    }

    const label = result[0].label.toLowerCase();

    if (label.includes("positive")) return "positive";
    if (label.includes("negative")) return "negative";
    return "neutral";
  } catch (error) {
    console.error("HuggingFace error:", err);
    return "neutral";
  }
};
