
import React, { useState, useEffect } from "react";
import { TbLogout2 } from "react-icons/tb";
import axios from "axios";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { VscAccount } from "react-icons/vsc";
import { useNavigate, useLocation } from "react-router-dom";
import useLauout from "../../statemanage/Lauout";
import { CgProfile } from "react-icons/cg";
import { MdOutlineAccountBox } from "react-icons/md";
import { FaRocketchat } from "react-icons/fa6";
import { TfiHelpAlt } from "react-icons/tfi";
import { useAuth } from "../../context/AuthProvider";
import { motion, AnimatePresence } from "framer-motion";
import { IoMdSettings } from "react-icons/io";
import { useSocketContext } from "../../context/socketcontext";


function Logout() {
  const [loading, setLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [authUser] = useAuth();
    const { socket } = useSocketContext();

  //console.log("this is auth", authUser);
  const { activeTab, SetactiveTab, selectedContact, SetSelectedContact } =
    useLauout();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.pathname === "/chat-page") {
      SetactiveTab("/chat-page");
    } else if (location.pathname === "/status-page") {
      SetactiveTab("/status-page");
    } else if (location.pathname === "/userprofile-page") {
      SetactiveTab("/profile-page");
    } else if (location.pathname === "/setting-page") {
      SetactiveTab("/setting-page");
    }
  }, [location.pathname]); // location changes trigger this

  const handleLogout = async () => {
    setLoading(true);
    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/v1/users/logout`);
      if (socket) {
      socket.emit("logout");   // <--- tell backend instantly
    }
      localStorage.removeItem("ChatApp");
      Cookies.remove("token");
      setLoading(false);
      navigate("/");
      toast.success("Logged out successfully");
      window.location.reload();
      
    } catch (error) {
      console.log("Error in Logout", error);
      toast.error("Error in logging out");
    }
  };
  const handleprofile = async () => {
    navigate("/profile-page");
  };

  const handleNavigate = (path) => {
    navigate(path);
    SetactiveTab(path);
    setShowMenu(false); // close menu after selecting
  };

  return (
    <div className="w-[4%] bg-slate-950 text-white flex flex-col justify-end relative">
      <div className="p-3">
        <button>
          <CgProfile
            className="text-5xl p-2 hover:bg-gray-600 rounded-lg duration-300"
            onClick={handleprofile}
          />
        </button>

        {/* Account Button */}
        <div className="relative">
          <button onClick={() => setShowMenu(!showMenu)}>
            <IoMdSettings className="text-5xl p-2 hover:bg-gray-600 rounded-lg duration-300" />
          </button>

          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, x: -20 }} // start slightly left & transparent
                animate={{ opacity: 1, x: 0 }} // slide in to position
                exit={{ opacity: 0, x: -20 }} // slide out when closed
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="absolute left-14 bottom-0 bg-slate-900/95 text-white rounded-xl shadow-2xl p-4 w-64 space-y-3 border border-slate-700 backdrop-blur-md"
              >
                {/* Header */}
                <h1 className="text-lg font-semibold text-gray-200 border-b border-slate-700 pb-2">
                  Settings
                </h1>

                {/* Search Bar */}
                <div>
                  <input
                    type="text"
                    placeholder="Search settings..."
                    className="w-full px-3 py-2 text-sm rounded-lg bg-slate-800 border border-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder-gray-400"
                  />
                </div>

                {/* Profile Section */}
                <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/60 border border-slate-700">
                  <img
                    src={authUser?.user?.profilepic || "/default-avatar.png"}
                    alt="Profile"
                    className="w-12 h-12 rounded-full object-cover border-2 border-blue-500"
                  />
                  <div>
                    <h3 className="font-medium text-white">
                      {authUser?.user?.firstname} <span>{authUser?.user?.lastname}</span>
                    </h3>
                    <h5 className="text-sm text-gray-400 truncate max-w-[140px]">
                      {authUser?.user?.about || "Hey there! I’m using ChatApp"}
                    </h5>
                  </div>
                </div>

                {/* Menu Options */}
                <button
                  onClick={() => handleNavigate("/profile-page")}
                  className="flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg hover:bg-slate-700 transition-colors"
                >
                  <MdOutlineAccountBox className="text-xl text-blue-400" />
                  <span>Account</span>
                </button>

                <button
                  onClick={() => handleNavigate("/chat-page")}
                  className="flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg hover:bg-slate-700 transition-colors"
                >
                  <FaRocketchat className="text-lg text-green-400" />
                  <span>Chat</span>
                </button>

                <button
                  onClick={() => handleNavigate("/help-page")}
                  className="flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg hover:bg-slate-700 transition-colors"
                >
                  <TfiHelpAlt className="text-lg text-yellow-400" />
                  <span>Help</span>
                </button>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 transition-colors mt-2"
                >
                  <TbLogout2 className="text-xl" />
                  <span>Logout</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default Logout;
