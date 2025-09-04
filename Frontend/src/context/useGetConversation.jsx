import { useEffect, useState } from "react";
import useConversation from "../statemanage/useConversation";
import axios from "axios";
import { useAuth } from "./AuthProvider";

const useGetConversation = () => {
  const [loading, setLoading] = useState(false);
  const [authUser] = useAuth();
  const { conversation, setConversation } = useConversation(); // ✅ fix spelling

  useEffect(() => {
    const fetchConversations = async () => {
      if (!authUser?.user?._id) return;

      setLoading(true);
      try {
        const res = await axios.get(`/api/v1/messages/getconversation`);
        //console.log("This is convertion:",res.data.data[0])
        if (res.data?.success) {
          setConversation(res.data.data[0]); // ✅ set conversation list
        } else {
          setConversation([]);
        }
      } catch (error) {
        console.error("Error in getting conversations:", error);
        setConversation([]);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [authUser?.user?._id, setConversation]);

  return { loading, conversation };
};

export default useGetConversation;
