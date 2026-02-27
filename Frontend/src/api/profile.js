import api from "./client.js"

export const uploadAvatar = async (file) => {
    const formData = new FormData();
    formData.append("avatar" , file);

    const res = await api.patch("/profile/avatar" , formData)
    return res.data;
}

export const updateProfile = async (data) => {
    const res = await api.patch("/profile/update" , data )
    return res.data
}