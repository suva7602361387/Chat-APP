// context/useGetMessages.js
import { useEffect, useState } from "react";
import useConversation from "../statemanage/useConversation";
import axios from "axios";

const useGetMessage = () => {
  const [loading, setLoading] = useState(false);
  const { messages, setMessage, selectedReceverId } = useConversation();

  useEffect(() => {
    const getMessages = async () => {
      if (!selectedReceverId?._id) return;
      setLoading(true);

      try {
        const res = await axios.get(
          `${process.env.VITE_BACKEND_URL}/api/v1/messages/getmessage/${selectedReceverId._id}`
        );
        setMessage(res.data); // overwrite with fresh API messages
      } catch (error) {
        console.error("❌ Error fetching messages:", error);
      } finally {
        setLoading(false);
      }
    };

    getMessages();
  }, [selectedReceverId, setMessage]);

  return { loading, messages, setMessage };
};

export default useGetMessage;
