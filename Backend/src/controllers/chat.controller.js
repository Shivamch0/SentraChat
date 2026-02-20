import { Chat } from "../models/chat.models.js";
import { User } from "../models/user.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

const chats = asyncHandler(async (req, res) => {
  const { targetedUser, chatName, users } = req.body;

  const currentUser = req.user?._id;
  if (!currentUser) {
    throw new ApiError(401, "User not authenticated...");
  }

  // Create private chat //
    if (targetedUser.toString() === currentUser.toString()) {
      throw new ApiError(400, "You cannot chat with yourself...");
    }

    const existTargetedUser = await User.findById(targetedUser);
    if (!existTargetedUser) {
      throw new ApiError(400, "Target User not found...");
    }

    const existedChat = await Chat.findOne({
      isGroupChat: false,
      users: { $all: [currentUser, targetedUser] },
    })
      .populate("users", "fullName userName avatar")
      .populate("latestMessage");

    if (existedChat) {
      return res
        .status(200)
        .json(new ApiResponse(200, existedChat, "Chat already exists..."));
    }

    const newChat = await Chat.create({
      isGroupChat: false,
      users: [currentUser, targetedUser],
    });

    const fullChat = await Chat.findById(newChat._id).populate(
      "users",
      "fullName userName avatar",
    );

    return res
      .status(201)
      .json(new ApiResponse(201, fullChat, "Private Chat Created..."));

  throw new ApiError(400, "Invalid chat request...");
});

const groupChat = asyncHandler(async (req, res) => {
  const { chatName, users } = req.body;

  const currentUser = req.user?._id;
  if (!currentUser) {
    throw new ApiError(401, "User not authenticated...");
  }

  const uniqueUsers = [...new Set(users)];

  const filteredUsers = uniqueUsers.filter(
    (id) => id.toString() !== currentUser.toString(),
  );

  // Create group chat //
  
    if (typeof chatName !== "string" || chatName.trim() === "") {
      throw new ApiError(400, "Group chat name is required...");
    }

    if (!Array.isArray(filteredUsers) || filteredUsers.length < 2) {
      throw new ApiError(400, "Group chat requires at least 3 members...");
    }

    if (users.includes(currentUser.toString())) {
      throw new ApiError(400, "Do not include yourself in users list...");
    }

    const validUsers = await User.find({
      _id: { $in: filteredUsers },
    });
    if (validUsers.length !== filteredUsers.length) {
      throw new ApiError(400, "One or more users not found...");
    }

    const groupUsers = [...filteredUsers, currentUser];

    const newGroup = await Chat.create({
      chatName: chatName.trim(),
      isGroupChat: true,
      users: groupUsers,
      groupAdmin: currentUser,
    });

    const fullGroup = await Chat.findById(newGroup._id)
      .populate("users", "fullName userName avatar")
      .populate("groupAdmin", "fullName userName avatar");

    return res
      .status(201)
      .json(new ApiResponse(201, fullGroup, "Group Chat created..."));

  throw new ApiError(400, "Invalid chat request...");
});

const getChats = asyncHandler(async (req, res) => {
    const currentUser = req.user?._id;

    if(!currentUser){
        throw new ApiError(401 , "User not authenticated...")
    }

    const chats = await Chat.find({
        users : {$in : [currentUser]}
    })
    .populate("users" , "fullName uesrName avatar")
    .populate("groupAdmin" , "fullName userName avatar")
    .populate({
        path : "latestMessage",
        populate : {
            path : "sendBy",
            select : "fullName userName avatar"
        }
    })
    .sort({updatedAt : -1});

    return res.status(200)
        .json(new ApiResponse(200 , chats , "Chats fetched successfully..."))
});

export { chats, groupChat, getChats };
