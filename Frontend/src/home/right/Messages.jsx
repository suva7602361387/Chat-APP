import React, { useEffect, useRef } from "react";
import Message from "./Message";
import useGetSocketMessage from "../../context/useGetSocketMessage"; // ✅
import Loading from "../../components/Loading";
import { useSocketContext } from "../../context/socketcontext";
import { useAuth } from "../../context/AuthProvider";
import useGetMessage from "../../context/useGetMessages";

function Messages() {
  const { loading, messages, setMessage } = useGetMessage();
  useGetSocketMessage(); // ✅ live socket updates
  const lastMsgRef = useRef();
  //console.log("jhjker:",messages?.length);
  const { socket } = useSocketContext();
  const [authUser] = useAuth();

  // ✅ Auto-scroll
  useEffect(() => {
    if (messages?.length > 0) {
      setTimeout(() => {
        lastMsgRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [messages]);

  // ✅ Mark as read
  useEffect(() => {
    if (!messages?.length || !socket) return;

   // ✅ Always ensure messages is an array
const safeMessages = Array.isArray(messages) ? messages : [];

const unreadMessageIds = safeMessages
  .filter(
    (msg) =>
      msg.receiverId?._id === authUser?.user?._id &&
      msg.messageStatus !== "read"
  )
  .map((msg) => msg._id);

if (unreadMessageIds.length > 0 && socket) {
  socket.emit("read_message", {
    messageIds: unreadMessageIds,
    readerId: authUser.user._id,
    senderId: safeMessages[0]?.senderId?._id,
  });

  setMessage((prevMessages) =>
    prevMessages.map((msg) =>
      unreadMessageIds.includes(msg._id)
        ? { ...msg, messageStatus: "read" }
        : msg
    )
  );
}

    //console.log("🖥️ Rendering messages:", messages);
  }, [messages, authUser, socket, setMessage]);
return (
  <div
    className="flex-1 overflow-y-auto"
    style={{ minHeight: "calc(92vh - 8vh)" }}
  >
    {loading ? (
      <Loading />
    ) : Array.isArray(messages) && messages.length > 0 ? (
     messages.map((msg,index) => (
  <Message key={msg._id || msg.id || index} message={msg} />   // 👈 send as message
))

    ) : (
      <p className="text-center mt-[20%] text-gray-400">
        Say Hi to start the conversation
      </p>
    )}
  </div>
);


}

export default Messages;
