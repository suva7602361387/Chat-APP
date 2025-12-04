// const express = require("express");

const { Server } = require("socket.io");
const User = require("../models/user.model");
const Message = require("../models/message.model");
require("dotenv").config();

const onlineuser = new Map();
const typinguser = new Map();
const BASE_URL=process.env.FRONTENT_URL;
const initilizeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin:BASE_URL ,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      credentials: true,
    },
    pingTimeout: 60000,
  });
  //app.set("io",io);
  io.on("connection", async (socket) => {
    console.log("🔌 User connected:", socket.id);

    const userId = socket.handshake.query.userId;

    if (userId) {
      // Track the new user
      onlineuser.set(userId, socket.id);
      socket.join(userId); // <<< JOIN PERSONAL ROOM

      console.log("✅ Online users:", [...onlineuser.keys()]);

      // Mark in DB
      User.findByIdAndUpdate(userId, {
        isOnline: true,
        lastSeen: new Date(),
      }).exec();

      // Broadcast the list of online users
      //io.emit("getOnlineUsers", [...onlineuser.keys()]);
      (async () => {
        const onlineUsersList = await User.find({
          _id: { $in: [...onlineuser.keys()] },
        })
          .select("firstname lastname profilepic isOnline lastSeen")
          .lean();
        io.emit("getOnlineUsers", onlineUsersList);
      })();
    }

    /**
     * Return status of any user
     */
    socket.on("get_user_status", (requestedUserId, callback) => {
      const isOnline = onlineuser.has(requestedUserId);
      callback({
        userId: requestedUserId,
        isOnline,
        lastSeen: isOnline ? new Date() : null,
      });
    });
    socket.on("logout", async () => {
    if (!userId) return;

    await User.findByIdAndUpdate(userId, {
      isOnline: false,
      lastSeen: new Date(),
    });

    onlineuser.delete(userId);
    socket.leave(userId);

    updateOnlineUsers();
    socket.disconnect(true); // close socket immediately
  });
    /**
     * Send message (if receiver is online forward it instantly)
     */
    socket.on("send_message", async (message) => {
  try {
    const receiverSocketId = onlineuser.get(message.receiverId?._id);
    const plainMsg = JSON.parse(JSON.stringify(message));

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("receive_message", plainMsg);
    }
  } catch (err) {
    console.error("Error sending message:", err);
  }
});

    /**
     * Mark messages as read
     */
  socket.on("read_message", async ({ messageIds, readerId, senderId }) => {
  try {
    await Message.updateMany(
      { _id: { $in: messageIds }, receiverId: readerId },
      { $set: { messageStatus: "read" } }
    );

    const senderSocketId = onlineuser.get(senderId);

    if (senderSocketId) {
      messageIds.forEach((messid) => {
        io.to(senderSocketId).emit("message_status_update", {
          messid, // ✅ use "messid" since frontend expects it
          messageStatus: "read",
        });
      });
    }
  } catch (err) {
    console.error("Error updating message:", err);
  }
});


    socket.on("delete_message", async ({ messageId, senderId, receiverId }) => {
  try {
    const message = await Message.findById(messageId);
    if (!message) return;

    // Ensure only the sender can delete their own message
    if (message.senderId.toString() !== senderId) {
      return;
    }

    await Message.findByIdAndDelete(messageId);

    // Notify both sender and receiver about deletion
    io.to(senderId.toString()).emit("message_deleted", { messageId });
    io.to(receiverId.toString()).emit("message_deleted", { messageId });

  } catch (error) {
    console.error("Error deleting message:", error);
  }
});


    /**
     * Typing indicator
     */
    socket.on("typing_start", (conversationId, receiverId) => {
      if (!userId || !conversationId || !receiverId) return;
      if (!typinguser.has(userId)) typinguser.set(userId, {});
      const t = typinguser.get(userId);

      t[conversationId] = true;
      if (t[`${conversationId}_timeout`])
        clearTimeout(t[`${conversationId}_timeout`]);

      t[`${conversationId}_timeout`] = setTimeout(() => {
        t[conversationId] = false;
        io.to(receiverId).emit("user_typing", {
          userId,
          conversationId,
          isTyping: false,
        });
      }, 3000);

      io.to(receiverId).emit("user_typing", {
        userId,
        conversationId,
        isTyping: true,
      });
    });

    socket.on("typing_stop", (conversationId, receiverId) => {
      if (!userId || !conversationId || !receiverId) return;
      const t = typinguser.get(userId);
      if (t) {
        t[conversationId] = false;
        if (t[`${conversationId}_timeout`]) {
          clearTimeout(t[`${conversationId}_timeout`]);
          delete t[`${conversationId}_timeout`];
        }
      }
      io.to(receiverId).emit("user_typing", {
        userId,
        conversationId,
        isTyping: false,
      });
    });

    /**
     * Add or update reaction
     */
    socket.on(
      "Add_reaction",
      async (messageId, emoji, userId, reactionUserId) => {
        try {
          const message = await Message.findById(messageId);
          if (!message) return;

          const existingIndex = message.reactions.findIndex(
            (r) => r.user.toString() === reactionUserId
          );

          if (existingIndex > -1) {
            const existing = message.reactions[existingIndex];
            if (existing.emoji === emoji) {
              message.reactions.splice(existingIndex, 1);
            } else {
              message.reactions[existingIndex].emoji = emoji;
            }
          } else {
            message.reactions.push({ user: reactionUserId, emoji });
          }

          await message.save();

          const populatedMessage = await Message.findById(message._id)
            .populate("senderId", "firstname email")
            .populate("receiverId", "firstname email")
            .populate("reactions.user", "firstname")
            .lean(); // ✅ Use lean here!

          const reactionsUpdated = {
            messageId,
            reactions: populatedMessage.reactions,
          };

          const senderSocket = onlineuser.get(
            populatedMessage.senderId._id.toString()
          );
          const receiverSocket = onlineuser.get(
            populatedMessage.receiverId._id.toString()
          );

          if (senderSocket) {
            io.to(senderSocket).emit("reaction_update", {
              messageId,
              reactions: populatedMessage.reactions,
            });
          }
          if (receiverSocket) {
            io.to(receiverSocket).emit("reaction_update", {
              messageId,
              reactions: populatedMessage.reactions,
            });
          }
        } catch (error) {
          console.error("Error handling reaction:", error);
        }
      }
    );

    /**
     * Handle disconnect
     */
    socket.on("disconnect", async () => {
      if (!userId) return;

      onlineuser.delete(userId);

      if (typinguser.has(userId)) {
        const userTyping = typinguser.get(userId);
        Object.keys(userTyping).forEach((key) => {
          if (key.endsWith("_timeout")) clearTimeout(userTyping[key]);
        });
        typinguser.delete(userId);
      }

      await User.findByIdAndUpdate(userId, {
        isOnline: false,
        lastSeen: new Date(),
      });
        updateOnlineUsers();
      io.emit("user_Status", {
        userId,
        isOnline: false,
        lastSeen: new Date(),
      });

      socket.leave(userId);
      console.log(`❌ User ${userId} disconnected`);
    });
    async function updateOnlineUsers() {
    const onlineUsersList = await User.find({ _id: { $in: [...onlineuser.keys()] } })
      .select("firstname lastname profilepic isOnline lastSeen")
      .lean();
    io.emit("getOnlineUsers", onlineUsersList);
  }
  });

  io.socketUserMap = onlineuser;
  return io;
};

module.exports = initilizeSocket;

