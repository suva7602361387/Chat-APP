import React, { useRef, useState, useEffect } from "react";
import { IoSend } from "react-icons/io5";
import { LuMessageCircleMore } from "react-icons/lu";
import { WiCloudUp } from "react-icons/wi";
import EmojiPicker from "emoji-picker-react";
import useSendMessage from "../../context/useSendmessage";
import useConversation from "../../statemanage/useConversation";

import { useSocketContext } from "../../context/socketcontext";
import { useAuth } from "../../context/AuthProvider";

function Typesend() {
  const [message, setMessage] = useState("");
  const [emoji, setEmoji] = useState(false);
  
  const { loading, sendMessages } = useSendMessage();

  const { selectedReceverId } = useConversation();
  const { socket } = useSocketContext();
  const [authUser] = useAuth();
  // ✅ React Query: fetch token
  
  const typingTimeoutRef = useRef(null);

  // stable conversation key (no DB id needed)
  const convKey =
    authUser?.user?._id && selectedReceverId?._id
      ? [authUser.user._id, selectedReceverId._id].sort().join(":")
      : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    await sendMessages({ message, image: null });

    // stop typing after sending
    if (socket && convKey) {
      socket.emit("typing_stop", convKey, selectedReceverId._id);
    }
    setMessage("");
    setEmoji(false);
  };

  const handleChange = (e) => {
    const val = e.target.value;
    setMessage(val);
    if (!socket || !convKey || !selectedReceverId?._id) return;

    socket.emit("typing_start", convKey, selectedReceverId._id);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing_stop", convKey, selectedReceverId._id);
    }, 1500);
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (socket && convKey && selectedReceverId?._id) {
        socket.emit("typing_stop", convKey, selectedReceverId._id);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [convKey]);

  const sendImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    await sendMessages({ message: "", image: file });
  };

  return (
    <form className="w-full" onSubmit={handleSubmit}>
      <div className="flex items-center justify-between bg-gray-800 px-4 py-2 rounded-xl h-[8vh]">
        <input
          type="text"
          placeholder="Type your message..."
          value={message}
          onChange={handleChange}
          className="flex-grow bg-slate-900 text-white placeholder-gray-400 px-4 py-2 rounded-xl outline-none border border-gray-700 focus:ring-2 focus:ring-blue-500 mr-3"
        />

        <label
          htmlFor="file"
          className="cursor-pointer text-white hover:text-blue-500 transition duration-200 mr-2"
        >
          <WiCloudUp className="text-2xl" />
          <input
            type="file"
            id="file"
            style={{ display: "none" }}
            accept="image/*,video/*"
            onChange={sendImage}
          />
        </label>

        <button
          type="button"
          className="flex text-white hover:text-blue-500 transition duration-200 mr-2"
          onClick={() => setEmoji(!emoji)}
        >
          <LuMessageCircleMore className="text-2xl" />
        </button>

        {emoji && (
          <div className="absolute bottom-[10vh] right-20 z-50">
            <EmojiPicker
              onEmojiClick={(e) => setMessage((prev) => prev + e.emoji)}
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex text-white hover:text-blue-500 transition duration-200"
        >
          <IoSend className="text-3xl" />
        </button>
      </div>
    </form>
  );
}

export default Typesend;
