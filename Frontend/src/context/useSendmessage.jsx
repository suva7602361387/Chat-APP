// import { useState } from "react";
// import useConversation from "../statemanage/useConversation";
// import axios from "axios";
// import { useAuth } from "./AuthProvider";
// import { useSocketContext } from "./socketcontext";

// const useSendMessage = () => {
//   const [loading, setLoading] = useState(false);
//   const [authUser] = useAuth();
//   const { selectedReceverId, setMessage } = useConversation();
//   const { socket } = useSocketContext();

//   const sendMessages = async ({
//     message = "",
//     image = null,
//     videocallurl = "",
//   }) => {
//     if (!selectedReceverId?._id) {
//       console.warn("⚠️ No conversation selected");
//       return;
//     }

//     setLoading(true);

//     try {
//       const formData = new FormData();
//       formData.append("senderId", authUser?.user?._id || "");
//       formData.append("receiverId", selectedReceverId._id || "");
//       formData.append("message", message);
//       formData.append("videocallurl", videocallurl);

//       if (image instanceof File) {
//         formData.append("file", image);
//       }

//       // ✅ API request
//       const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/v1/messages/sendmessage`, formData, {
//         headers: { "Content-Type": "multipart/form-data" },
//         withCredentials: true,
//       });

//       if (res.data.success) {
//         const newMsg = res.data.data;

//         // ✅ Optimistic update in UI
//         //setMessage((prev) => [...prev, newMsg]);

//         // ✅ Emit socket event so the receiver gets it instantly
//         if (socket) {
//           socket.emit("send_message", newMsg);
//         }

//         console.log("📤 Sending message payload:", newMsg);
//       }
//     } catch (error) {
//       console.error(
//         "❌ Error sending message:",
//         error.response?.data || error.message
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   return { loading, sendMessages };
// };

// export default useSendMessage;
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
    // ✅ Validate required fields
    if (!selectedReceverId?._id) {
      console.error("⚠️ No conversation selected");
      return;
    }

    if (!authUser?.user?._id) {
      console.error("⚠️ User not authenticated");
      return;
    }

    // ✅ Check if there's actually content to send
    if (!message.trim() && !image && !videocallurl.trim()) {
      console.warn("⚠️ No content to send");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("senderId", authUser.user._id);
      formData.append("receiverId", selectedReceverId._id);
      formData.append("message", message.trim());
      formData.append("videocallurl", videocallurl.trim());

      if (image instanceof File) {
        formData.append("file", image);
      }

      console.log("📤 Sending message...");

      // ✅ API request
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/messages/sendmessage`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );

      if (res.data.success) {
        const newMsg = res.data.data;

        // ✅ Update UI with new message
        setMessage((prev) => [...prev, newMsg]);

        // ✅ Emit socket event for real-time update
        if (socket) {
          socket.emit("send_message", newMsg);
        }

        console.log("✅ Message sent successfully:", newMsg);
      }
    } catch (error) {
      console.error("❌ Error sending message:", error.response?.data || error.message);
      
      // ✅ Show user-friendly error
      if (error.response?.status === 401) {
        console.error("🔒 Authentication failed. Please login again.");
      } else if (error.response?.status === 500) {
        console.error("🔥 Server error. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  return { loading, sendMessages };
};

export default useSendMessage;