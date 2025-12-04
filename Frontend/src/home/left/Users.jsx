// import React from "react";
// import User from "./User";
// //import useGetAllUsers from "../../context/useGetAllUsers";
// import UseGetAllUser from "../../context/useGetAllUser";
// import useGetConversation from "../../hooks/useGetConversation";

// function Users() {
//    const [allUsers] = UseGetAllUser();
//   //console.log(allUsers);
  
//   const { conversations, loading } = useGetConversation();

//    return (
//     <div>
//       <h1 className="px-8 py-2 text-white font-semibold bg-slate-800 rounded-md">
//         Messages
//       </h1>
//       <div
//         className="py-2 flex-1 overflow-y-auto"
//         style={{ maxHeight: "calc(84vh - 10vh)" }}
//       >
//         {allUsers.map((user, index) => (
//           <User key={index} user={user} />
//         ))}
//       </div>
//     </div>
//   );

// }

// export default Users;
import React from "react";
import User from "./User";
import UseGetAllUser from "../../context/useGetAllUser";
import useGetConversation from "../../context/useGetConversation";
import { useAuth } from "../../context/AuthProvider";

function Users() {
  const [authUser] = useAuth();
  const [allUsers] = UseGetAllUser();
  const { conversations, loading } = useGetConversation();
    console.log("this is convertion:",conversations);

  // Map conversations by userId for quick lookup
  const conversationMap = {};
  conversations.forEach((convo) => {
    const otherUser = convo?.members?.find(m => m?._id !== authUser._id);
    if (otherUser?._id) {
      conversationMap[otherUser._id] = convo;
    }
  });

  return (
    <div>
      <h1 className="px-8 py-2 text-white font-semibold bg-slate-800 rounded-md">
        Messages
      </h1>

      <div
        className="py-2 flex-1 overflow-y-auto"
        style={{ maxHeight: "calc(84vh - 10vh)" }}
      >
        {/* Loading */}
        {loading && <p className="text-gray-400 text-center">Loading...</p>}

        {/* User List Always Visible */}
        {!loading &&
          allUsers.map((user, index) => {
            const convo = conversationMap[user._id] || null;

            return (
              <User 
                key={index} 
                user={user} 
                conversation={convo} 
              />
            );
          })}
      </div>
    </div>
  );
}

export default Users;
