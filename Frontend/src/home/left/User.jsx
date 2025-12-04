import React from "react";
import useConversation from "../../statemanage/useConversation";
import { useSocketContext } from "../../context/socketcontext";
import { useAuth } from "../../context/AuthProvider";

function User({ user, conversation }) {
  const { selectedReceverId, setSelectedReceverId } = useConversation();
  const { onlineUsers = [] } = useSocketContext();
  const [authUser] = useAuth();

  const isSelected = selectedReceverId?._id === user?._id;
  const isOnline = Array.isArray(onlineUsers) && onlineUsers.includes(user?._id);

  // ----- Last message (support populated object or plain id) -----
  const lastMsgRaw = conversation?.lastMessage || null;
  // lastMsg may be populated (object) or an id, so guard carefully
  const lastMsg = typeof lastMsgRaw === "object" ? lastMsgRaw : null;

  let lastText = "";
  if (lastMsg) {
    if (lastMsg.isDeleted) {
      lastText = "Message deleted";
    } else if (lastMsg.imageOrVideoUrl) {
      lastText = lastMsg.messageType === "image" ? "📷 Photo" : "🎥 Video";
    } else if (lastMsg.videocallurl) {
      lastText = "📞 Video Call";
    } else {
      lastText = lastMsg.message || "";
    }

    // prepend "You:" if last message was sent by current user
    const lastSenderId = (lastMsg.senderId && (lastMsg.senderId._id || lastMsg.senderId))?.toString();
    if (authUser?._id && lastSenderId === authUser._id.toString()) {
      lastText = `You: ${lastText}`;
    }
  }

  // ----- Unread count: conversation.unreadCount is an array [{user, count}] -----
  let unread = 0;
  try {
    const entry = conversation?.unreadCount?.find(
      (u) => u?.user?.toString() === authUser?._id?.toString()
    );
    unread = entry ? entry.count || 0 : 0;
  } catch (e) {
    unread = 0;
  }

  return (
    <div
      className={`flex items-center gap-4 p-3 cursor-pointer rounded-md transition 
        ${isSelected ? "bg-slate-700 text-white" : "hover:bg-slate-800 text-gray-200"}`}
      onClick={() => setSelectedReceverId(user)}
    >
      {/* Avatar */}
      <div className="relative">
        <img
          src={user?.profilepic || "/default-avatar.png"}
          className="w-12 h-12 rounded-full object-cover"
          alt="User"
        />
        {isOnline && (
          <span className="absolute bottom-0 right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900"></span>
        )}
      </div>

      {/* Name + Last Message */}
      <div className="flex flex-col flex-1 min-w-0">
        <h1 className="font-semibold truncate">{user?.firstname} {user?.lastname}</h1>
        <span className="text-sm text-gray-400 truncate max-w-[180px]">
          {lastText || "No messages yet"}
        </span>
      </div>

      {/* Unread Badge */}
      {unread > 0 && (
        <div className="bg-blue-500 text-white text-xs rounded-full px-2 py-1">
          {unread}
        </div>
      )}
    </div>
  );
}

export default User;
