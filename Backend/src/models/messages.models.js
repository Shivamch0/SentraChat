import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    sendBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
    },
    // text message Or Media URL
    message: {
      type: String,
      required: true,
    },
    // optional caption for media (text + emoji allowed)
    caption: {
      type: String,
    },
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    messageType: {
      type: String,
      enum: ["text", "image", "file", "emoji", "audio"],
      default: "text",
    },
    emotionType: {
      type: String,
      enum: ["positive", "negative", "neutral"],
      default: "neutral",
    },
    reactions: [
      {
        emoji: {
          type: String,
          required: true,
        },
        users: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
        ],
      },
    ],
    messageStatus: {
      type: String,
      enum: ["sent", "seen", "delivered"],
      default: "sent",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },

    editedAt: {
      type: Date,
    },
  },
  { timestamps: true },
);

messageSchema.index({ message: "text", caption: "text" });

export const Message = mongoose.model("Message", messageSchema);
