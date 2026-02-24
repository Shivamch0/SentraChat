import api from "./client.js";

const createPrivateChat = async (targetedUser) =>{
    const res = await api.post("/chat/chat" , { targetedUser });
    return res.data
}

const createGroupChat = async (chatName , users) =>{
    const res = await api.post("/chat/group/chat" , { chatName , users });
    return res.data
}

const fetchChats = async () =>{
    const res = await api.get("/chat/getChat");
    return res.data
}

const markSeen = async (chatId) =>{
    const res = await api.post(`/chat/mark-seen/${chatId}`);
    return res.data
}

export { createPrivateChat , createGroupChat , fetchChats , markSeen  }