// // context/useGetSocketMessage.js
// import { useEffect } from "react";
// import { useSocketContext } from "./socketcontext";
// import useConversation from "../statemanage/useConversation";
// import sound from "../assets/sound.mp3";

// const useGetSocketMessage = () => {
//   const { socket } = useSocketContext();
//   const { setMessage, selectedReceverId } = useConversation();

//  useEffect(() => {
//   if (!socket) return;

//   const handleNewMessage = (msg) => {
//     if (
//       msg.senderId._id === selectedReceverId?._id ||
//       msg.receiverId._id === selectedReceverId?._id
//     ) {
//       setMessage((prev) => {
//         if (!Array.isArray(prev)) return [msg];
//         if (prev.some(m => m._id === msg._id)) return prev;
//         return [...prev, msg];
//       });
//     }
//   };

//   socket.on("receive_message", handleNewMessage);

//   return () => {
//     socket.off("receive_message", handleNewMessage);
//   };
// }, [socket, selectedReceverId?._id, setMessage]);

// };

// export default useGetSocketMessage;

// context/useGetSocketMessage.js
import { useEffect } from "react";
import { useSocketContext } from "./socketcontext";
import useConversation from "../statemanage/useConversation";
import sound from "../assets/sound.mp3";

const useGetSocketMessage = () => {
  const { socket } = useSocketContext();
  const { setMessage, selectedReceverId } = useConversation();

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msg) => {
      if (
        msg.senderId._id === selectedReceverId?._id ||
        msg.receiverId._id === selectedReceverId?._id
      ) {
        setMessage((prev) => {
          if (!Array.isArray(prev)) return [msg];
          if (prev.some((m) => m._id === msg._id)) return prev;

          // ✅ play sound only for new message
          new Audio(sound).play().catch(() => {});

          return [...prev, msg];
        });
      }
    };

    socket.on("receive_message", handleNewMessage);

    return () => {
      socket.off("receive_message", handleNewMessage);
    };
  }, [socket, selectedReceverId?._id, setMessage]);
};

export default useGetSocketMessage;
