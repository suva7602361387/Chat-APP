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

        // ✅ Always extract array safely
        const fetchedMessages = res.data?.messages || res.data?.data || [];
        setMessage(fetchedMessages);
      } catch (error) {
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