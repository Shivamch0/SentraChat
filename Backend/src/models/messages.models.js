import mongoose from "mongoose";

const messageSchema = new mongoose.Schema ({
    messages : {
        type : String
    },
    sendBy :{
        type : mongoose.Schema.Types.ObjectId,
        ref : "User"
    }
} , {timestamps : true});

export const Message = mongoose.model("Message" , messageSchema)