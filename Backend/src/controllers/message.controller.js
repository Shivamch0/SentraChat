import { Message } from "../models/messages.models.js";
import { Chat } from "../models/chat.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { analyzeEmotion } from "../services/emotion.service.js";

const sendMessage = asyncHandler(async (req, res) => {
  const { chatId, message, messageType = "text" } = req.body;
  const sendBy = req.user._id;

  if (!chatId) {
    throw new ApiError(401, "Chat id is required...");
  }

  if (!message) {
    throw new ApiError(401, "Message cannot be empty...");
  }

  let emotionType = await analyzeEmotion(message);

  const text = message.toLowerCase();
  if (text.includes("happy") || text.includes("love")) {
    emotionType = "positive";
  } else if (text.includes("angry") || text.includes("sad")) {
    emotionType = "negative";
  }

  const newMessage = await Message.create({
    sendBy,
    chat: chatId,
    message,
    messageType,
    emotionType,
    messageStatus: "sent",
  });

  await Chat.findByIdAndUpdate(chatId, {
    latestMessage: newMessage._id,
  });

  const fullMessage = await Message.findById(newMessage._id)
    .populate("sendBy", "fullName userName avatar")
    .populate({
      path: "chat",
      populate: {
        path: "users",
        select: "fullName userName avatar",
      },  
    });  

  const io = req.app.get("io");
  io.to(chatId).emit("message received", fullMessage);

  await Message.findByIdAndUpdate(fullMessage._id, {
    messageStatus: "delivered",
  });

  io.to(chatId).emit("message delivered", {
    messageId: fullMessage._id,
  });

  fullMessage.chat.users.forEach((user) => {
    if (user._id.toString() !== sendBy.toString()) {
      io.to(user._id.toString()).emit("new notification", {
        chatId,
        message: fullMessage.message,
        sender: fullMessage.sendBy,
      });
    }
  });

  return res
    .status(201)
    .json(new ApiResponse(201, fullMessage, "Message sent successfully..."));
});

const getMessage = asyncHandler(async (req, res) => {
  const { chatId } = req.params;

  if (!chatId) {
    throw new ApiError(401, "User id is required...");
  }

  /*
      ADDED: pagination query params
      Example: ?page=1&limit=20
    */
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;

  /*
       ADDED: calculate how many docs to skip
    */
  const skip = (page - 1) * limit;

  const messages = await Message.find({ chat: chatId })
    .sort({ createdAt: 1 }) // oldest first
    .skip(skip)
    .limit(limit)
    .populate("sendBy", "fullName userName avatar")
    .populate("chat");

  const totalMessages = await Message.countDocuments({ chat: chatId });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        messages: messages.reverse(), // ✅ ADDED: return oldest → newest in UI
        page,
        limit,
        totalMessages,
        totalPages: Math.ceil(totalMessages / limit),
      },
      "Messages fetched successfully...",
    ),
  );
});

export { sendMessage, getMessage };
