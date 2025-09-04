import React from "react";
import useConversation from "../../statemanage/useConversation";
import { useSocketContext } from "../../context/socketcontext";

function User({ user }) {
  const { selectedReceverId, setSelectedReceverId } = useConversation();
  const { onlineUsers = [] } = useSocketContext(); // default empty array

  const isSelected = selectedReceverId?._id === user._id;
  const isOnline = Array.isArray(onlineUsers) && onlineUsers.includes(user._id);

  return (
   <div
  className={`user-item ${isSelected ? "selected" : ""}`}
  onClick={() => setSelectedReceverId?.(user)}
>
  <div className="relative">
    <div className={`avatar ${isOnline ? "avatar-online" : ""}`}>
      <div className="w-12 rounded-full">
        <img src={user.profilepic || "/default-avatar.png"} alt="User" />
      </div>
    </div>
  </div>
  <div>
    <h1 className="font-bold">
      {user.firstname} <span>{user.lastname}</span>
    </h1>
    {/* <span className="text-sm text-gray-400">{user.email}</span> */}
  </div>
</div>

  );
}

export default User;
