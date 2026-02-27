import fetch from "node-fetch";

export const getEmotionFromAPI = async (message) => {
  try {

    const response = await fetch("http://localhost:5000/api/v1/emotion/detect", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    });

    const data = await response.json();

    return data?.data?.emotion || "neutral";
  } catch (err) {
    console.error("Emotion API failed:", err);
    return "neutral";
  }
};