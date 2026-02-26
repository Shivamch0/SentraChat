import api from "./client";

const registerUser = async (data) => {
    const res = await api.post("/users/register" , data);
    return res.data;
}

const loginUser = async (data) => {
    const res = await api.post("/users/login" , data)
    return res.data
}

const logOutUser = async (data) => {
    const res = await api.post("/users/logout" , data)
    return res.data
}

const refreshToken = async () => {
    const res = await api.post("/users/refreshToken")
    return res.data
}

const getCurrentUser = async () => {
    const res = await api.get("/users/current-user")
    return res.data
}

export { registerUser , loginUser , logOutUser , refreshToken , getCurrentUser }