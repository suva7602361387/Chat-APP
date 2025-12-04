import React, { useState } from "react";
import Search from "./Search";
import Users from "./Users";
import { PlusCircle } from "lucide-react";

function Left() {
  
  return (
    <div className="w-[30%] h-screen bg-[#0f0f0f] text-gray-200 flex flex-col border-r border-gray-700">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
        <h1 className="font-bold text-2xl tracking-wide">Chats</h1>

        
      </div>

      <div className="px-4 py-3">
        <Search />
      </div>

      <hr className="border-gray-700" />

      {/* When a new group is created, refresh Users */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 hover:scrollbar-thumb-gray-600">
        <Users />
      </div>

     
    </div>
  );
}


export default Left;
