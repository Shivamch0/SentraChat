import { Message } from "../models/messages.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

const sendMessage = asyncHandler( async ( req , res ) => {
    const { receivedBy , message , messageType} = req.body;
    console.log(req.body)
    const sendBy = req.user._id;

    if(!receivedBy){
        throw new ApiError(401 , "Reciever id is required...");
    }

    if(!message || messageType !== "text"){
        throw new ApiError(401 , "Message cannot be empty...")
    }

    let emotionType = "neutral"

    if(message){
        const text = message.toLowerCase();

        if(text.includes("happy") || text.includes("love")){
            emotionType = "positive"
        }else if(text.includes("angry") || text.includes("sad")){
            emotionType = "negative"
        }
    }

    const newMessage = await Message.create({
        sendBy,
        receivedBy,
        message,
        messageType,
        emotionType,
        messageStatus : "sent"
    })

    return res.status(200)
            .json(new ApiResponse ( 200 , newMessage , "Message sent successfully..."))

});

const getMessage = asyncHandler( async (req , res ) => {
    const { userId } = req.params // chat partner id 

    const currentUserId = req.user._id;

    if(!userId){
        throw new ApiError(401 , "User id is required...");
    }

    const messages = await Message.find({
        $or : [
            {sendBy : currentUserId , receivedBy : userId},
            {sendBy : userId , receivedBy : currentUserId}
        ]
    })
    .sort({createdAt : 1}) // oldest first
    .populate( "sendBy" , "fullName userName avatar")
    .populate( "receivedBy" , "fullName userName avatar" )


    return res.status(200)
            .json(new ApiResponse(200 , messages , "Messages fetched successfully..."))
});

export { sendMessage , getMessage }