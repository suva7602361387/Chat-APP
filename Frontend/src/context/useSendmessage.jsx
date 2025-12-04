import { useState } from "react";
import useConversation from "../statemanage/useConversation";
import axios from "axios";
import { useAuth } from "./AuthProvider";
import { useSocketContext } from "./socketcontext";

const useSendMessage = () => {
  const [loading, setLoading] = useState(false);
  const [authUser] = useAuth();
  const { selectedReceverId, setMessage } = useConversation();
  const { socket } = useSocketContext();

  const sendMessages = async ({
    message = "",
    image = null,
    videocallurl = "",
  }) => {
    if (!selectedReceverId?._id) {
      console.warn("⚠️ No conversation selected");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("senderId", authUser?.user?._id || "");
      formData.append("receiverId", selectedReceverId._id || "");
      formData.append("message", message);
      formData.append("videocallurl", videocallurl);

      if (image instanceof File) {
        formData.append("file", image);
      }

      // ✅ API request
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/v1/messages/sendmessage`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      if (res.data.success) {
        const newMsg = res.data.data;

        // ✅ Optimistic update in UI
        //setMessage((prev) => [...prev, newMsg]);

        // ✅ Emit socket event so the receiver gets it instantly
        if (socket) {
          socket.emit("send_message", newMsg);
        }

        console.log("📤 Sending message payload:", newMsg);
      }
    } catch (error) {
      console.error(
        "❌ Error sending message:",
        error.response?.data || error.message
      );
    } finally {
      setLoading(false);
    }
  };

  return { loading, sendMessages };
};

export default useSendMessage;
