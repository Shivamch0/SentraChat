import { Message } from "../models/messages.models.js";
import { Chat } from "../models/chat.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { analyzeEmotion } from "../services/emotion.service.js";
import { Notification } from "../models/notification.model.js";

const sendMessage = asyncHandler(async (req, res) => {
  const { chatId, message, replyTo } = req.body;
  const sendBy = req.user._id;

  if (!chatId) {
    throw new ApiError(401, "Chat id is required...");
  }

  if (!message) {
    throw new ApiError(401, "Message cannot be empty...");
  }

  if (replyTo) {
    const originalMessage = await Message.findById(replyTo);
    if (!originalMessage) {
      throw new ApiError(404, "Original message not found");
    }
  }

  let emotionType = await analyzeEmotion(message);

  const newMessage = await Message.create({
    sendBy,
    chat: chatId,
    message,
    replyTo: replyTo || null,
    messageType: "text",
    emotionType,
    messageStatus: "sent",
  });

  await Chat.findByIdAndUpdate(chatId, {
    latestMessage: newMessage._id,
  });

  const fullMessage = await Message.findById(newMessage._id)
    .populate("sendBy", "fullName userName avatar")
    .populate({
      path: "replyTo",
      populate: {
        path: "sendBy",
        select: "fullName userName avatar",
      },
    })
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

  for (const user of fullMessage.chat.users) {
    if (user._id.toString() !== sendBy.toString()) {
      await Notification.create({
        user: user._id,
        type: "message",
        message: fullMessage._id,
        chat: chatId,
      });

      io.to(user._id.toString()).emit("new notification", {
        chatId,
        message: fullMessage.message,
        sender: fullMessage.sendBy,
      });
    }
  }

  return res
    .status(201)
    .json(new ApiResponse(201, fullMessage, "Message sent successfully..."));
});

const sendMediaMessage = asyncHandler(async (req, res) => {
  const { chatId, messageType, caption, replyTo } = req.body;
  const sendBy = req.user._id;

  if (!chatId) {
    throw new ApiError(400, "Chat id required...");
  }

  if (!req.file) {
    throw new ApiError(400, "Media file required...");
  }

  if (replyTo) {
    const originalMessage = await Message.findById(replyTo);
    if (!originalMessage) {
      throw new ApiError(404, "Original message not found");
    }
  }

  const mediaUrl = `${req.protocol}://${req.get("host")}/${req.file.path}`;

  let emotionType = "neutral";
  if (caption) {
    emotionType = await analyzeEmotion(caption);
  }

  const newMessage = await Message.create({
    sendBy,
    chat: chatId,
    message: mediaUrl,
    replyTo: replyTo || null,
    caption: caption || "",
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
      path: "replyTo",
      populate: {
        path: "sendBy",
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

  return res
    .status(201)
    .json(new ApiResponse(201, fullMessage, "Media sent successfully"));
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
    .populate("chat")
    .populate({
      path: "replyTo",
      populate: {
        path: "sendBy",
        select: "fullName userName avatar",
      },
    });

  const totalMessages = await Message.countDocuments({ chat: chatId });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        messages,
        page,
        limit,
        totalMessages,
        totalPages: Math.ceil(totalMessages / limit),
      },
      "Messages fetched successfully...",
    ),
  );
});

const editMessage = asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  const { newText } = req.body;

  if (!newText) {
    throw new ApiError(400, "New message text required...");
  }

  const message = await Message.findById(messageId);
  if (!message) {
    throw new ApiError(400, "Message not found...");
  }

  if (message.sendBy.toString() !== req.user._id.toString()) {
    throw new ApiError(400, "Not allowed to edit message...");
  }

  message.message = newText;
  message.editedAt = new Date();

  await message.save();

  const io = req.app.get("io");
  io.to(message.chat.toString()).emit("message updated", message);

  return res
    .status(200)
    .json(new ApiResponse(200, message, "Message edited successfully"));
});

const deleteMessage = asyncHandler(async (req, res) => {
  const { messageId } = req.params;

  const message = await Message.findById(messageId);

  if (!message) {
    throw new ApiError(404, "Message not found");
  }

  if (message.sendBy.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Not allowed to delete this message");
  }

  message.isDeleted = true;
  message.message = "This message was deleted";

  await message.save();

  const io = req.app.get("io");
  io.to(message.chat.toString()).emit("message updated", message);

  return res.status(200).json(new ApiResponse(200, {}, "Message deleted"));
});

const reactToMessage = asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  const { emoji } = req.body;
  const userId = req.user._id;

  if (!emoji) {
    throw new ApiError(400, "Emoji required");
  }

  const message = await Message.findById(messageId);

  if (!message) {
    throw new ApiError(404, "Message not found");
  }

  // Check if this emoji already exists
  const existingReaction = message.reactions.find((r) => r.emoji === emoji);

  if (existingReaction) {
    const alreadyReacted = existingReaction.users.includes(userId);

    if (alreadyReacted) {
      // remove reaction (toggle)
      existingReaction.users.pull(userId);

      // if no users left remove emoji entry
      if (existingReaction.users.length === 0) {
        message.reactions = message.reactions.filter((r) => r.emoji !== emoji);
      }
    } else {
      existingReaction.users.push(userId);
    }
  } else {
    message.reactions.push({
      emoji,
      users: [userId],
    });
  }

  await message.save();

  const io = req.app.get("io");
  io.to(message.chat.toString()).emit("reaction updated", message);

  return res
    .status(200)
    .json(new ApiResponse(200, message.reactions, "Reaction updated"));
});

const searchMessages = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const { query } = req.query;

  if (!query) {
    throw new ApiError(400, "Search query required");
  }

  const messages = await Message.find({
    chat: chatId,
    $text: { $search: query },
  })
    .populate("sendBy", "fullName userName avatar")
    .sort({ createdAt: -1 })
    .limit(20);

  return res.status(200).json(new ApiResponse(200, messages, "Search results"));
});

const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({
    user: req.user._id,
  })
    .populate("message")
    .populate("chat")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, notifications, "Notifications fetched"));
});

export {
  sendMessage,
  getMessage,
  sendMediaMessage,
  editMessage,
  deleteMessage,
  reactToMessage,
  searchMessages,
  getNotifications,
};
