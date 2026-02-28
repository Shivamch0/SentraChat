import api from "./client";

export const fetchMessages = async (chatId, page = 1) => {
  const res = await api.get(`/message/${chatId}?page=${page}&limit=20`);

  return res.data;
};

export const sendMessageApi = async (chatId, message) => {
  const res = await api.post("/message/sendMessage", {
    chatId,
    message,
  });
  return res.data;
};

export const sendMediaApi = async (chatId, file) => {
  const formData = new FormData();
  formData.append("chatId", chatId);
  formData.append("media", file);

  const type = file.type.startsWith("image")
    ? "image"
    : file.type.startsWith("video")
      ? "video"
      : file.type.startsWith("audio")
        ? "audio"
        : "file";

  formData.append("messageType", type);

  const res = await api.post("/message/sendMedia" , formData)
  return res.data
};

export const reactToMessageApi = async (messageId, emoji) => {
  const res = await api.post(`/message/react/${messageId}`, { emoji });
  return res.data;
};

export const deleteMessage = async (messageId) => {
  const res = await api.delete(`/message/delete/${messageId}`);
  return res.data;
};

export const searchMessages = async (chatId, query) => {
  const res = await api.get(`/message/search/${chatId}?query=${query}`);
  return res.data;
};

export const getEmotionFromApi = async () => {
  const res = await api.post("/emotion/detect");
  return res.data;
};
