import React, { useState, useEffect } from "react";
import { useSocketContext } from "../../context/socketcontext";
import { useAuth } from "../../context/AuthProvider";
import useConversation from "../../statemanage/useConversation";
import axios from "axios";
import toast from "react-hot-toast";

const emojis = [
  "👍", "❤️", "😂", "🔥", "😢", "👏", "🎉", "😍", "😎", "🤔", "🙏", "💯", "🗑️"
];

function Message({ message }) {
  const { socket } = useSocketContext();
  const [authUser] = useAuth();
  const { selectedReceverId } = useConversation();
  // console.log("This is mesage:",message),
   //console.log("This is auth:",authUser);
  const itsMe = message.senderId?._id === authUser?.user?._id;
  const chatName = itsMe ? "chat-end" : "chat-start";
  const chatColor = itsMe ? "bg-blue-500" : "bg-gray-700";

  const createdAt = new Date(message.timestamp);
  const formattedTime = createdAt.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const [reactions, setReactions] = useState(message.reactions || []);
  const [showPicker, setShowPicker] = useState(false);
  const [isDeleted, setIsDeleted] = useState(message.isDeleted || false);
  const [status, setStatus] = useState(message.messageStatus || "sent"); // ✅ track ticks

  // ✅ Socket listeners
  useEffect(() => {
    if (!socket || !message?._id) return;

    const handleReactionUpdate = ({ messageId, reactions }) => {
      if (messageId === message._id) {
        setReactions(reactions);
      }
    };

    const handleDeleteUpdate = ({ messageId }) => {
      if (messageId === message._id) {
        setIsDeleted(true);
      }
    };

    const handleStatusUpdate = ({ messid, messageStatus }) => {
      if (messid === message._id) {
        setStatus(messageStatus);
      }
    };

    socket.on("reaction_update", handleReactionUpdate);
    socket.on("message_deleted", handleDeleteUpdate);
    socket.on("message_status_update", handleStatusUpdate);

    return () => {
      socket.off("reaction_update", handleReactionUpdate);
      socket.off("message_deleted", handleDeleteUpdate);
      socket.off("message_status_update", handleStatusUpdate);
    };
  }, [socket, message._id]);

  // ✅ Delete message
  const handleDelete = async (messageId) => {
    try {
      const res = await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/messages/deletemeseges/${messageId}`,
        {
          withCredentials: true,
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      if (res.data.success) {
        toast.success("Message deleted");
        setIsDeleted(true);

        socket.emit("delete_message", {
          messageId,
          senderId: authUser.user._id,
          receiverId: selectedReceverId._id,
        });
      }
    } catch (err) {
      console.error("Delete error:", err.response?.data || err.message);
      toast.error("Failed to delete message");
    }
  };

  // ✅ Reaction handler
  const handleReaction = (emoji) => {
    if (emoji === "🗑️") {
      handleDelete(message._id);
    } else {
      socket.emit("Add_reaction", {
        messageId: message._id,
        emoji,
        userId: authUser.user._id,
        receiverId: selectedReceverId._id,
      });

      setReactions((prev) => [
        ...prev,
        { emoji, user: { firstname: authUser.user.firstname } },
      ]);
    }
  };

  // ✅ Render content
  const renderContent = () => {
    if (isDeleted) {
      return (
        <span className="italic text-gray-300">This message was deleted</span>
      );
    }

    if (message.videocallurl) {
      return (
        <a
          href={message.videocallurl}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-center text-sm px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg mt-1"
        >
          📹 Join Video Call
        </a>
      );
    }

    if (message.imageOrVideoUrl) {
      if (message.messageType === "image") {
        return (
          <img
            src={message.imageOrVideoUrl}
            alt="shared"
            className="max-w-[250px] rounded-lg mt-1"
          />
        );
      } else if (message.messageType === "video") {
        return (
          <video
            src={message.imageOrVideoUrl}
            controls
            className="max-w-[250px] rounded-lg mt-1"
          />
        );
      }
    }

    return <span>{message.message}</span>;
  };

  // ✅ Tick Renderer
  const renderTicks = () => {
    if (!itsMe) return null;
    if (status === "sent") return <span>✓</span>;
    if (status === "delivered") return <span>✓✓</span>;
    if (status === "read")
      return <span className="text-blue-400">✓✓</span>;
  };

  return (
    <div className="p-2 relative">
      <div className={`chat ${chatName}`}>
        <div
          className={`chat-bubble text-white ${chatColor} relative cursor-pointer`}
          onClick={() => {
            if (!message.videocallurl && !isDeleted) {
              setShowPicker((prev) => !prev);
            }
          }}
        >
          {/* Message Content */}
          {renderContent()}

          {/* Reactions */}
          {reactions.length > 0 && !isDeleted && (
            <div className="flex gap-1 mt-1">
              {reactions.map((r, i) => (
                <span
                  key={i}
                  className="text-sm bg-white/30 rounded-md px-1"
                  title={r.user?.firstname}
                >
                  {r.emoji}
                </span>
              ))}
            </div>
          )}

          {/* Emoji picker */}
          {showPicker && !isDeleted && (
            <div className="absolute -top-9 left-0 flex flex-row gap-2 bg-white shadow-md rounded-lg px-2 py-2 z-50 max-w-[200px] overflow-x-auto">
              {emojis.map((emoji) => (
                <span
                  key={emoji}
                  onClick={() => handleReaction(emoji)}
                  className="cursor-pointer text-lg hover:scale-125 transition"
                >
                  {emoji}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Time + ticks */}
        <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
          {formattedTime} {renderTicks()}
        </div>
      </div>
    </div>
  );
}

export default Message;
