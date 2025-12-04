import React, { useEffect, useMemo, useState } from "react";
import useConversation from "../../statemanage/useConversation";
import { useSocketContext } from "../../context/socketcontext";
import { useAuth } from "../../context/AuthProvider";
import { useQuery } from "@tanstack/react-query";
import useSendMessage from "../../context/useSendmessage";
import { getStreamToken } from "../../lib/Auth";
import CallButton from "./Callbutton";
import { StreamChat } from "stream-chat";
import toast from "react-hot-toast";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

// Global singleton Stream client
const chatClient = StreamChat.getInstance(STREAM_API_KEY);
let isChatConnected = false;

function Chatuser() {
  const { selectedReceverId } = useConversation();
  const { socket, onlineUsers } = useSocketContext();
  const { sendMessages } = useSendMessage();
  const [authUser] = useAuth();
  const [channel, setChannel] = useState(null);
  const [isTyping, setIsTyping] = useState(false);

  // Fetch Stream token
  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser,
  });

  // Initialize Stream Chat + Channel
  useEffect(() => {
    const setupChat = async () => {
      if (!authUser || !selectedReceverId || !tokenData?.token) return;

      try {
        const user = authUser.user || authUser;

        if (!isChatConnected) {
          await chatClient.connectUser(
            {
              id: user._id,
              name: user.firstname,
              image: user.profilepic,
            },
            tokenData.token
          );
          isChatConnected = true;
        }

        // Stable, valid channel ID for both chat and video call
        const channelId = [user._id, selectedReceverId._id].sort().join("_");

        const newChannel = chatClient.channel("messaging", channelId, {
          members: [user._id, selectedReceverId._id],
        });

        await newChannel.watch();
        setChannel(newChannel);

        console.log("✔ Channel ID:", newChannel.id);
      } catch (err) {
        console.error("Stream chat init error:", err);
        toast.error("Could not connect to chat.");
      }
    };

    setupChat();
  }, [tokenData, authUser, selectedReceverId]);

  // Typing indicator with socket
  const convKey = useMemo(() => {
    const u = authUser?.user || authUser;
    if (!u?._id || !selectedReceverId?._id) return null;
    return [u._id, selectedReceverId._id].sort().join(":");
  }, [authUser, selectedReceverId?._id]);

  useEffect(() => {
    if (!socket || !convKey) return;

    const handleTyping = ({ userId, conversationId, isTyping }) => {
      if (conversationId === convKey && selectedReceverId._id === userId) {
        setIsTyping(isTyping);
      }
    };

    socket.on("user_typing", handleTyping);
    return () => socket.off("user_typing", handleTyping);
  }, [socket, convKey, selectedReceverId?._id]);

  if (!selectedReceverId) return null;

  const defaultAvatar = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

  const isOnline = onlineUsers.some((u) => u._id === selectedReceverId._id);

  const getUserStatus = () => {
    if (isTyping) return "Typing… ✍️";
    if (isOnline) return "Online";
    return "Offline";
  };

  // ⭐ FIXED WORKING VIDEO CALL FUNCTION
  const handleVideoCall = async () => {
    try {
      if (!channel) {
        toast.error("Chat channel not ready yet!");
        return;
      }

      if (!isOnline) {
        toast.error(`${selectedReceverId.firstname} is offline.`);
        return;
      }

      const callId = channel.id;
      const videocallurl = `${window.location.origin}/call/${callId}`;

      console.log("🎥 Starting call with ID:", callId);

      // Send message via your Mongo/WebSocket system
      await sendMessages({
        message: `I've started a video call. Join here: ${videocallurl}`,
        videocallurl,
      });

      // Send to Stream Chat (must send only text)
      await channel.sendMessage({
        text: `I've started a video call. Join here: ${videocallurl}`,
      });

      toast.success("Video call link sent successfully!");
    } catch (err) {
      console.error("Video call error:", err);
      toast.error("Failed to send video call link.");
    }
  };

  return (
    <div className="sticky top-0 z-20 flex items-center justify-between px-5 py-3 bg-gray-800 border-b border-gray-700 shadow-lg">
      {/* Avatar + Online Dot */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <img
            src={selectedReceverId?.profilepic || defaultAvatar}
            alt="user"
            className="w-12 h-12 rounded-full border-2 border-gray-300"
          />
          <span
            className={`absolute bottom-1 right-1 w-3 h-3 rounded-full ${
              isOnline ? "bg-green-500" : "bg-white"
            }`}
          ></span>
        </div>

        {/* Name + Status */}
        <div className="flex flex-col text-white">
          <span className="font-semibold text-lg">
            {selectedReceverId.firstname} {selectedReceverId.lastname}
          </span>
          <span className="text-sm">{getUserStatus()}</span>
        </div>
      </div>

      {/* Video Call Button */}
      <CallButton
        handleVideoCall={handleVideoCall}
        disabled={!channel}
        className="ml-auto"
      />
    </div>
  );
}

export default Chatuser;
