import mongoose from "mongoose";

const messageSchema = new mongoose.Schema ({
    messages : {
        type : String
    }
});

export const Message = mongoose.model("Message" , messageSchema)