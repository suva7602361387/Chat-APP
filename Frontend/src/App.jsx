// import React from "react";
// import Left from "./home/left/Left";
// import Right from "./home/right/Right";
// import Signup from "./components/Signup";
// import Login from "./components/Login";
import { useAuth } from "./context/AuthProvider";
// import { Toaster } from "react-hot-toast";
// import Logout from "./home/left1/Logout";
// import CallPage from "./home/CallPage";
// import { Navigate, Route, Routes } from "react-router-dom";
// import Loading from "./components/Loading";
 import Profile from "./Profile/Profilepic";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import VerifyEmail from "./pages/VerifyEmail";
import { Route,Routes,Navigate } from "react-router-dom";
import Chatpage from "./pages/Chatpage";
import HelpPage from "./pages/HelpPage";
import Contact from "./pages/Contact";
import CallPage from "./home/CallPage";
function App() {
  const [authUser, setAuthUser] = useAuth();
  //console.log(authUser.user);
  return(
    <div>
      <Routes>
        <Route
        path="/"
        element={<Signup/>}
        />
        <Route
        path="/"
        element={
          authUser ? (
            <Chatpage/>
          ):(
                    <Navigate to={"/login"} />          )
        }
        />
         <Route
      path="/login"
      element={<Login/>}
      />
       <Route
      path="/verify-email"
      element={<VerifyEmail/>}
      />
       <Route
        path="/call/:id"
        element={
          authUser ?(
            <CallPage/>
          ):(
            <Navigate to={"/"}/>
          )
        }
        />
      <Route
      path="/chat-page"
      element={<Chatpage/>}
      />
      <Route
      path="/profile-page"
      element={<Profile/>}
      />
      <Route
      path="/help-page"
      element={<HelpPage/>}
      />
      <Route path="/help-page-contact-page" element={<Contact/>}/>

      </Routes>
     
    </div>
  )
  // return (
  //   <>
  //     <Routes>
  //       <Route
  //         path="/"
  //         element={
  //           authUser ? (
  //             <div className="flex h-screen">
  //               <Logout />
  //               <Left />
  //               <Right />
  //             </div>
              
              


            
  //           ) : (
  //             <Navigate to={"/login"} />
  //           )
            
  //         }
  //       />
  //       <Route
  //         path="/profile"
  //         element={ <Profile />}
  //       />
  //       <Route
  //       path="/call/:id"
  //       element={
  //         authUser ?(
  //           <CallPage/>
  //         ):(
  //           <Navigate to={"/"}/>
  //         )
  //       }
  //       />
  //       <Route
  //         path="/login"
  //          element={authUser?( <Navigate to={"/"}/>): <Login />}
  //       />
  //       <Route
  //         path="/signup"
  //         element={<Signup />}
  //       />
  //     </Routes>
  //     <Toaster />
  //   </>
  // );
}

export default App;















 