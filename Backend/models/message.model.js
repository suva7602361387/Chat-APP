const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Conversation",
  },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  // text message
  message: { type: String, required: false },

  // media message
  imageOrVideoUrl: { type: String, required: false },

  // videocall
  videocallurl: { type: String, required: false },

  messageType: {
    type: String,
    enum: ["video", "image", "text", "call"],
    default: "text",
  },

  reactions: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      emoji: String,
    },
  ],

  messageStatus: { type: String, default: "sent" },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Message", messageSchema);
