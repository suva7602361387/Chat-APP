import { useEffect, useState } from "react";
import useConversation from "../statemanage/useConversation";
import axios from "axios";
import { useAuth } from "./AuthProvider";
const useGetMessage = () => {
  const [loading, setLoading] = useState(false);
  const { messages, setMessage, selectedReceverId } = useConversation();
    const [authUser]=useAuth();

  useEffect(() => {
    const getMessages = async () => {
      if (!selectedReceverId?._id) return;

      setLoading(true);
      const token=authUser.token;

      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/messages/getmessage/${selectedReceverId._id}`,
          {
             credentials: "include",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          }
        );
                       //    console.log("this is mes",res.data);

        // ✅ Always extract array safely
        // const fetchedMessages = res.data?.message ;
          const fetchedMessages = Array.isArray(res.data) ? res.data : [];

        setMessage(fetchedMessages);
            //    console.log("this is mes",fetchedMessages);

      } catch (error) {
        console.log(error);
        console.error("❌ Error fetching messages:", error);
        setMessage([]); // reset to empty array on error
      } finally {
        setLoading(false);
      }
    };

    getMessages();
  }, [selectedReceverId, setMessage]);

  return { loading, messages, setMessage };
};
export default useGetMessage