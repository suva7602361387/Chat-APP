// socketcontext.jsx
import io from "socket.io-client";
import { createContext, useState, useEffect, useContext } from "react";
import { useAuth } from "./AuthProvider";
import {jwtDecode} from "jwt-decode";


const SocketContext = createContext();
export const useSocketContext = () => useContext(SocketContext);

const URL = import.meta.env.VITE_BACKEND_URL;

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [authUser] = useAuth();
 
  useEffect(() => {
    if (authUser?.user?._id) {
      const newSocket = io(URL, {
        query: { userId: authUser.user._id }, 
        withCredentials: true,
      });

      setSocket(newSocket);

      newSocket.on("getOnlineUsers", (users) => {
          //console.log("📡 Online users from server:", users);

        setOnlineUsers(users);
      });

      return () => {
        newSocket.disconnect();
      };
    }
  }, [authUser]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};
