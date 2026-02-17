import mongoose from "mongoose";

const messageSchema = new mongoose.Schema ({
    sendBy :{
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required : true
    },
    receivedBy : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required : true
    },
    message : {
        type : String,
    },
    messageType : {
        type : String,
        enum : ["text" , "image" , "file" , "emoji" , "audio"],
        default : "text"
    },
    emotionType : {
        type : String,
        enum : ["positive" , "negative" , "neutral"],
        default : "neutral"
    },
    messageStatus : {
        type : String,
        enum : ["sent" , "seen" , "delivered"],
        default : "sent"
    },
} , {timestamps : true});

export const Message = mongoose.model("Message" , messageSchema)