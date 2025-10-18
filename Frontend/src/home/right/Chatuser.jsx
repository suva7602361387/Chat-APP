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

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY

function Chatuser() {
  const { selectedReceverId } = useConversation();
  const { socket, onlineUsers } = useSocketContext();
  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const { sendMessages } = useSendMessage();
  const [authUser] = useAuth();
   //console.log("This is auth:", STREAM_API_KEY);
   //console.log("This is receber:", selectedReceverId);
  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser,
  });

  // ✅ Initialize Stream Chat
  useEffect(() => {
    const initChat = async () => {
          console.log("this is tokenData:",tokenData);
          console.log("this is authUser:",authUser);

  if (!tokenData?.token || !authUser || !selectedReceverId) return;
  
  try {
    const client = StreamChat.getInstance(STREAM_API_KEY);
              //console.log("hhke:",tokenData);

    await client.connectUser(
      {
        id: authUser?.user?._id,
        name: authUser?.user?.firstname,
        image: authUser?.user?.profilepic,
      },
      tokenData.token
    );

    // ⚡ Ensure receiver exists in Stream (needs backend ideally)
    // await client.upsertUser({
    //   id: selectedReceverId._id,
    //   name: selectedReceverId.firstname,
    //   image: selectedReceverId.profilepic,
    // });

    const channelId = [authUser?.user?._id, selectedReceverId._id].sort().join("-");
    const currChannel = client.channel("messaging", channelId, {
      members: [authUser?.user?._id, selectedReceverId._id],
    });
    console.log("This is chennel:",currChannel);

    await currChannel.watch();
    setChatClient(client);
    setChannel(currChannel);
  } catch (error) {
    console.error("Error initializing chat:", error);
    toast.error("Could not connect to chat. Please try again.");
  }
};


    initChat();
  }, [tokenData, authUser,selectedReceverId]);

  const handleVideoCall = async () => {
    try {
       if (!channel) {
    toast.error("Chat channel not ready yet!");
    return;
  }
      
    } catch (error) {
      console.log("This error:",error);
      
    }
 

  // ✅ Check if receiver is online before sending
  const isReceiverOnline = onlineUsers.some(
    (u) => u._id === selectedReceverId._id
  );

  if (!isReceiverOnline) {
    toast.error(`${selectedReceverId.firstname} is offline. Cannot start a call.`);
    return;
  }

  const videocallurl = `${window.location.origin}/call/${channel.id}`;
  try {
    await sendMessages({
      message: "I've started a video call. Join me here:",
      videocallurl,
    });

    toast.success("Video call link sent successfully!");
  } catch (error) {
    console.error("Error sending call message:", error);
    toast.error("Failed to send video call link.");
  }
};

  const [isTyping, setIsTyping] = useState(false);

  const convKey = useMemo(() => {
    if (!authUser?.user?._id || !selectedReceverId?._id) return null;
    return [authUser.user._id, selectedReceverId._id].sort().join(":");
  }, [authUser?.user?._id, selectedReceverId?._id]);

  // Typing events
  useEffect(() => {
    if (!socket) return;
    const handleTyping = ({ userId, conversationId, isTyping }) => {
      if (selectedReceverId?._id === userId && conversationId === convKey) {
        setIsTyping(!!isTyping);
      }
    };
    socket.on("user_typing", handleTyping);
    return () => socket.off("user_typing", handleTyping);
  }, [socket, selectedReceverId?._id, convKey]);

  if (!selectedReceverId) return null;

  const defaultAvatar = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

  const formatLastSeen = (timestamp) => {
    if (!timestamp) return "Unknown";
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const isOnline = onlineUsers.some((u) => u._id === selectedReceverId._id);
  //console.log("onlineUsers:", onlineUsers);

  const getUserStatus = (user) => {
    if (isTyping) return "Typing… ✍️";
    if (isOnline) return "Online";
    return `Last seen at ${formatLastSeen(user?.lastSeen)}`;
  };

  return (
    <div className="sticky top-0 z-20 flex items-center justify-between px-5 py-3 bg-gradient-to-r from-gray-800 to-gray-700 border-b border-gray-600 shadow-lg">
      {/* Avatar + Online dot */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-300 shadow-md">
            <img
              src={selectedReceverId?.profilepic || defaultAvatar}
              alt={`${selectedReceverId.firstname} ${selectedReceverId.lastname}`}
              className="w-full h-full object-cover"
            />
          </div>
          <span
            className={`absolute bottom-1 right-1 w-3 h-3 rounded-full border-2 border-white ${
              isOnline ? "bg-green-500 animate-pulse" : "bg-gray-400"
            }`}
          />
        </div>

        {/* Name + Status */}
        <div className="flex flex-col">
          <h1 className="text-white text-[16px] font-semibold">
            <pre>
               {selectedReceverId.firstname} {selectedReceverId.lastname}
 

            </pre>
           
            
          </h1>
          <span
            className={`text-xs ${
              isTyping
                ? "text-purple-300 animate-pulse"
                : isOnline
                ? "text-green-400"
                : "text-gray-400"
            }`}
          >
            {getUserStatus(selectedReceverId)}
          </span>
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
