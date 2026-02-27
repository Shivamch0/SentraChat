import api from "./client";

export const fetchMessages = async (chatId , page = 1) => {
  const res = await api.get(`/message/${chatId}?page=${page}&limit=20`);
  
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

export const deleteMessage = async (messageId) => {
  const res = await api.delete(`/message/delete/${messageId}`);
  return res.data;
}

export const searchMessages = async (chatId , query) => {
  const res = await api.get(`/message/search/${chatId}?query=${query}`);
  return res.data
}

export const getEmotionFromApi = async () => {
  const res = await api.post("/emotion/detect");
  return res.data;
}