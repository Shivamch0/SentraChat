import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
    chatName : {
        type : String,
        trim : true
    },
    isGroupChat : {
        type : Boolean,
    },
    users : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User"
    },
    latestMessage : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Message"
    },
    groupAdmin : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User"
    }
});

export const Chat = mongoose.model("Chat" , chatSchema)