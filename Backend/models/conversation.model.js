const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    lastmessages:[
       {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message",
      },

    ],
    unreadCount:{type:Number,default:0},
    messages: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Conversation", conversationSchema);
