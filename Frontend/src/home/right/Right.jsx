import React, { useEffect } from "react";
import Chatuser from "./Chatuser";
import Messages from "./Messages";
import Typesend from "./Typesend";

// import useConversation from "../../statemanage/useConversation.js";
// import { useAuth } from "../../context/AuthProvider.jsx";
 import { CiMenuFries } from "react-icons/ci";
import { useAuth } from "../../context/AuthProvider";
import Loading from "../../components/Loading";
import useConversation from "../../statemanage/useConversation";

function Right() {
  const { selectedReceverId, setSelectedReceverId } = useConversation();
  useEffect(() => {
    return setSelectedReceverId(null);
  }, [setSelectedReceverId]);
  //console.log(selectedReceverId);
   return (
    <div className="w-full bg-slate-900 text-gray-300">
      <div>
        {!selectedReceverId ? (
          <NoChatSelected />
        ) : (
          <>
            <Chatuser />
            <div
              className=" flex-1 overflow-y-auto"
              style={{ maxHeight: "calc(88vh - 8vh)" }}
            >
              <Messages />
            </div>
            <Typesend />
          </>
        )}
      </div>
    </div>
  );
}

export default Right;

const NoChatSelected = () => {
  const [authUser] = useAuth();
 // console.log("this is auth:",authUser)
  if (!authUser || !authUser.user) {
    return <Loading />; // or just return null / "Loading..."
  }

  return (
    <div className="relative">
      <label
        htmlFor="my-drawer-2"
        className="btn btn-ghost drawer-button lg:hidden absolute left-5"
      >
        <CiMenuFries className="text-white text-xl" />
      </label>
      <div className="flex h-screen items-center justify-center">
        <h1 className="text-center">
          Welcome{" "}
          <span className="font-semibold text-xl">
            {authUser.user.firstname} <span>{authUser.user.lastname}</span>
          </span>
          <br />
          No chat selected, please start conversation by selecting anyone to
          your contacts
        </h1>
      </div>
    </div>
  );
};
