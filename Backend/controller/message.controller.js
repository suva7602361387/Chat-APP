const mkdirSync = require("fs");
const renameSync = require("fs");
const cloudinary = require("cloudinary").v2;
const uploadtocloudinary = require("../config/cloudinary");
const Message = require("../models/message.model");
const Conversation = require("../models/conversation.model");
const { getReceiverSocketId, io } = require("../SocketiO/server");
const path = require("path");
const { updateOne } = require("../models/otp.model");

// -------------------- SEND MESSAGE --------------------
// exports.sendmessage = async (req, res) => {
//   try {
//     const { message, messageStatus, senderId, receiverId } = req.body;
//     let file = req.file || (req.files && req.files.file);
//     let mediaUrl = null;
//     let messageType = "text";
//     console.log("this is file:",file);
//     // Handle media upload
//     if (file) {
//       //const uploaded = await uploadtocloudinary(file);
//       const response = await cloudinary.uploader.upload(file.tempFilePath, {
//         folder: "Chat-App",
//         resource_type: "auto",
//       });
//       if (!response?.secure_url) {
//         return res.status(400).json({ success: false, message: "File upload failed" });
//       }

//       mediaUrl = response.secure_url;
//       if (file.mimetype.startsWith("image")) messageType = "image";
//       else if (file.mimetype.startsWith("video")) messageType = "video";
      
//       else return res.status(400).json({ success: false, message: "Unsupported file type" });
//     }
//      else if (!message?.trim()) {
//       return res.status(400).json({ success: false, message: "Message content is required" });
//     }
    

//     // Find or create conversation
//     let conversation = await Conversation.findOne({
//       members: { $all: [senderId, receiverId] },
//     });

//     if (!conversation) {
//       conversation = await Conversation.create({
//         members: [senderId, receiverId],
//         messages: [],
//         unreadCounts: { [receiverId]: 0, [senderId]: 0 },
//       });
//     }

//     // Create new message
//     const newMessage = await Message.create({
//   conversation: conversation._id,
//   senderId,
//   receiverId,
//   message,
//   imageOrVideoUrl: mediaUrl || null,
//   videocallurl: req.body.videocallurl || null, // ✅ add call link
//   messageType,
//   messageStatus: messageStatus || "sent",
// });


//     // Update conversation
//     conversation.messages.push(newMessage._id);
//     conversation.lastmessages = newMessage._id;

//     // Increase unread count only for receiver
//     if (conversation.unreadCounts) {
//       conversation.unreadCounts[receiverId] = (conversation.unreadCounts[receiverId] || 0) + 1;
//     }

//     await conversation.save();

//     // Populate message for response + socket
//     const populatedMessage = await Message.findById(newMessage._id)
//       .populate("senderId", "firstname email profilepic")
//       .populate("receiverId", "firstname email profilepic");

//     // Emit via socket
//    if (req.io && req.socketUserMap) {
//   const receiverSocketId = req.socketUserMap.get(receiverId);
//   const senderSocketId = req.socketUserMap.get(senderId);

//  if (receiverSocketId) {
//   req.io.to(receiverSocketId).emit("receive_message", populatedMessage);
//   console.log("📡 Sent socket message to receiver:", receiverSocketId);
// }
// if (senderSocketId) {
//   req.io.to(senderSocketId).emit("receive_message", populatedMessage);
//   console.log("📡 Sent socket message to sender:", senderSocketId);
// }

// }

//   console.log("📤 Server response data:", populatedMessage);


//     res.status(200).json({
//       success: true,
//       message: "Message sent successfully",
//       data: populatedMessage,
//     });
//   } catch (error) {
//     console.error("Error in sendMessage:", error);
//     res.status(500).json({ success: false, message: "Internal server error" });
//   }
// };
exports.sendmessage = async (req, res) => {
  try {
    const { message, messageStatus, senderId, receiverId, videocallurl } = req.body;

    let file = req.file || (req.files && req.files.file);
    let mediaUrl = null;
    let messageType = "text";

    // ============================
    // VALIDATION
    // ============================
    if (!file && (!message || !message.trim())) {
      return res.status(400).json({
        success: false,
        message: "Message content is required",
      });
    }

    // ============================
    // MEDIA UPLOAD
    // ============================
    if (file) {
      const uploaded = await cloudinary.uploader.upload(file.tempFilePath, {
        folder: "Chat-App",
        resource_type: "auto",
      });

      if (!uploaded?.secure_url) {
        return res.status(400).json({
          success: false,
          message: "File upload failed",
        });
      }

      mediaUrl = uploaded.secure_url;

      if (file.mimetype.startsWith("image")) messageType = "image";
      else if (file.mimetype.startsWith("video")) messageType = "video";
      else return res.status(400).json({ success: false, message: "Unsupported file type" });
    }

    // ============================
    // FIND OR CREATE CONVERSATION
    // ============================
    let conversation = await Conversation.findOne({
      members: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        members: [senderId, receiverId],
        messages: [],
        unreadCount: [
          { user: senderId, count: 0 },
          { user: receiverId, count: 0 }
        ]
      });
    }

    // ============================
    // CREATE MESSAGE
    // ============================
    const newMessage = await Message.create({
      conversation: conversation._id,
      senderId,
      receiverId,
      message,
      imageOrVideoUrl: mediaUrl,
      videocallurl: videocallurl || null,
      messageType,
      messageStatus: messageStatus || "sent",
    });

    // Push to conversation
    conversation.messages.push(newMessage._id);
    conversation.lastMessage = newMessage._id;

    // ============================
    // UPDATE UNREAD COUNT
    // ============================
    let receiverUnread = conversation.unreadCount.find(
      (u) => u.user.toString() === receiverId
    );

    if (!receiverUnread) {
      conversation.unreadCount.push({ user: receiverId, count: 1 });
    } else {
      receiverUnread.count += 1;
    }

    await conversation.save();

    // ============================
    // POPULATE MESSAGE FOR RESPONSE
    // ============================
    const populatedMessage = await Message.findById(newMessage._id)
      .populate("senderId", "firstname email profilepic")
      .populate("receiverId", "firstname email profilepic");

    // ============================
    // SOCKET EMIT
    // ============================
    if (req.io && req.socketUserMap) {
      const receiverSocket = req.socketUserMap.get(receiverId);
      const senderSocket = req.socketUserMap.get(senderId);

      if (receiverSocket) {
        req.io.to(receiverSocket).emit("receive_message", populatedMessage);
      }
      if (senderSocket) {
        req.io.to(senderSocket).emit("receive_message", populatedMessage);
      }
    }

    res.status(200).json({
      success: true,
      message: "Message sent successfully",
      data: populatedMessage,
    });

  } catch (error) {
    console.error("Error in sendmessage:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};




// -------------------- GET CONVERSATIONS --------------------
// exports.getConversation = async (req, res) => {
//   try {
//     const userId = req.user._id;

//     const conversations = await Conversation.find({ members: userId })
//       .populate("members", "firstname lastSeen isOnline profilepic")
//       .populate({
//         path: "lastmessages",
//         populate: {
//           path: "senderId receiverId",
//           select: "firstname profilepic",
//         },
//       })
//       .sort({ updatedAt: -1 });

//     res
//       .status(200)
//       .json({
//         success: true,
//         message: "getConversation successfully",
//         data: conversations,
//       });
//   } catch (error) {
//     console.error("Error in getConversation:", error);
//     res.status(500).json({ success: false, message: "Internal server error" });
//   }
// };
exports.getConversation = async (req, res) => {
  try {
    const userId = req.user._id;

    const conversations = await Conversation.find({ members: userId })
      .populate("members", "firstname lastname profilepic isOnline lastSeen")
      .populate({
        path: "lastMessage",
        populate: {
          path: "senderId receiverId",
          select: "firstname profilepic",
        },
      })
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      message: "Conversations fetched successfully",
      data: conversations,
    });

  } catch (error) {
    console.error("Error in getConversation:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};





exports.getmessage = async (req, res) => {
  try {
    const { id: chatUserId } = req.params; // chat partner
    const senderId = req.user._id;

    // Find conversation between two users
    const conversation = await Conversation.findOne({
      members: { $all: [senderId, chatUserId] },
    });

    if (!conversation) {
      return res.status(200).json([]);
    }

    // Get all messages sorted oldest → newest
    const messages = await Message.find({ conversation: conversation._id })
      .populate("senderId", "firstname email profilepic")
      .populate("receiverId", "firstname email profilepic")
      .sort({ createdAt: 1 });

    // Mark all received messages as read
    await Message.updateMany(
      {
        conversation: conversation._id,
        receiverId: senderId,
        messageStatus: { $in: ["sent", "delivered"] },
      },
      { $set: { messageStatus: "read" } }
    );

    // Reset unread count only for this user
    if (conversation.unreadCounts && conversation.unreadCounts[senderId] !== undefined) {
      conversation.unreadCounts[senderId] = 0;
      await conversation.save();
    }

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error in getmessage:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};



// -------------------- MARK AS READ --------------------
// exports.markasread = async (req, res) => {
//   try {
//     const { messageIds } = req.body;
//     const userId = req.user._id;

//     if (!Array.isArray(messageIds)) {
//       return res.status(400).json({ success: false, message: "messageIds must be an array" });
//     }

//     // find relevant messages
//     const messages = await Message.find({
//       _id: { $in: messageIds },
//       receiverId: userId,
//     });

//     if (!messages.length) {
//       return res.status(404).json({ success: false, message: "No messages found" });
//     }

//     // bulk update
//     await Message.updateMany(
//       { _id: { $in: messageIds }, receiverId: userId },
//       { $set: { messageStatus: "read" } }
//     );

//     // notify senders via socket
//     if (req.io && req.socketUserMap) {
//       for (const message of messages) {
//         const senderSocketId = req.socketUserMap.get(message.senderId.toString());
//         if (senderSocketId) {
//           req.io.to(senderSocketId).emit("message_read", {
//             _id: message._id,
//             messageStatus: "read",
//           });
//         }
//       }
//     }

//     res.status(200).json({
//       success: true,
//       message: "Messages marked as read",
//       data: messages.map((m) => ({ _id: m._id, messageStatus: "read" })),
//     });
//   } catch (error) {
//     console.error("Error in markasread:", error);
//     res.status(500).json({ success: false, message: "Internal server error" });
//   }
// };
exports.markasread = async (req, res) => {
  try {
    const { messageIds, conversationId } = req.body;
    const userId = req.user._id;

    if (!Array.isArray(messageIds)) {
      return res.status(400).json({
        success: false,
        message: "messageIds must be an array",
      });
    }

    // ============================
    // 🔹 Find messages that belong to user
    // ============================
    const messages = await Message.find({
      _id: { $in: messageIds },
      receiverId: userId,
    });

    if (!messages.length) {
      return res.status(404).json({
        success: false,
        message: "No messages found",
      });
    }

    // ============================
    // 🔹 Mark messageStatus: "read"
    // ============================
    await Message.updateMany(
      { _id: { $in: messageIds }, receiverId: userId },
      { $set: { messageStatus: "read" } }
    );

    // ============================
    // 🔹 Reset unread count in conversation
    // ============================
    const conversation = await Conversation.findById(conversationId);
    if (conversation) {
      conversation.unreadCounts.set(userId.toString(), 0);
      await conversation.save();
    }

    // ============================
    // 🔹 Notify sender via socket
    // ============================
    if (req.io && req.socketUserMap) {
      for (const msg of messages) {
        const senderSocket = req.socketUserMap.get(msg.senderId.toString());
        if (senderSocket) {
          req.io.to(senderSocket).emit("message_read", {
            _id: msg._id,
            messageStatus: "read",
          });
        }
      }
    }

    res.status(200).json({
      success: true,
      message: "Messages marked as read",
      data: messageIds.map((id) => ({ _id: id, messageStatus: "read" })),
    });

  } catch (error) {
    console.error("Error in markasread:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};



// -------------------- DELETE MESSAGE --------------------
exports.deleteMessage = async (req, res) => {
  try {
    const { id: messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ success: false, message: "Message not found" });
    }

    // mark as deleted
    message.isDeleted = true;
    await message.save();

    // find both users in the conversation
    const { senderId, receiverId } = message;

    // notify BOTH sender and receiver
    if (req.io && req.socketUserMap) {
      const senderSocketId = req.socketUserMap.get(senderId.toString());
      const receiverSocketId = req.socketUserMap.get(receiverId.toString());

      const payload = { messageId };

      if (senderSocketId) {
        req.io.to(senderSocketId).emit("message_deleted", payload);
      }
      if (receiverSocketId) {
        req.io.to(receiverSocketId).emit("message_deleted", payload);
      }
    }

    return res.status(200).json({ success: true, message: "Message deleted" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.uploadfiles = async (req, res) => {
  
  try {
    //fetch file from request
    const file = req.files.file;
    console.log("This is files->", file);
    //create path where file need to stored on server
    let path =
      __dirname + "/files/" + Date.now() + `.${file.name.split(".")[1]}`;
    console.log("This is path", path);
    //add path to the move function
    file.mv(path, (err) => {
      console.log(err);
    });
    res.json({
      success: true,
      message: "File upload successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "User can not be registor,plase try again later",
    });
  }
};
exports.localupload = (req, res) => {
  try {
    //fetch file from request
    const file = req.files.file;
    console.log("This is files->", file);
    //create path where file need to stored on server
    let path =
      __dirname + "/files/" + Date.now() + `.${file.name.split(".")[1]}`;
    console.log("This is path", path);
    //add path to the move function
    file.mv(path, (err) => {
      console.log(err);
    });
    res.json({
      success: true,
      message: "File upload successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "User can not be registor,plase try again later",
    });
  }
};
