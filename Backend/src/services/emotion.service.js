import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config({
  path: ".env",
});

const HUGGING_FACE_TOKEN = process.env.HUGGING_FACE_API_KEY;

export const analyzeEmotion = async (text) => {
  try {
    const response = await fetch(
      "https://router.huggingface.co/hf-inference/models/cardiffnlp/twitter-roberta-base-sentiment",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HUGGING_FACE_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: text }),
      }
    );

    const result = await response.json();

    if (!Array.isArray(result) || !Array.isArray(result[0])) {
      return "neutral";
    }

    const predictions = result[0];

    const best = predictions.reduce((prev, curr) =>
      curr.score > prev.score ? curr : prev
    );

    switch (best.label) {
      case "LABEL_2":
        return "positive";
      case "LABEL_0":
        return "negative";
      case "LABEL_1":
      default:
        return "neutral";
    }

  } catch (error) {
    console.error("HuggingFace error:", error);
    return "neutral";
  }
};