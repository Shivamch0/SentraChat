import api from "./client";

export const fetchMessages = async (chatId) => {
  const res = await api.get(`/message/${chatId}`);
  return res.data;
};

export const sendMessageApi = async (chatId, message) => {
  const res = await api.post("/message/sendMessage", {
    chatId,
    message
  });
  return res.data;
};

export const reactToMessageApi = async (messageId, emoji) => {
  const res = await api.post(`/message/react/${messageId}`, { emoji });
  return res.data;
};