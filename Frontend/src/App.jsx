import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { useAuth } from "./context/AuthProvider";

import Signup from "./pages/Signup";
import Login from "./pages/Login";
import VerifyEmail from "./pages/VerifyEmail";
import Chatpage from "./pages/Chatpage";
import HelpPage from "./pages/HelpPage";
import Contact from "./pages/Contact";
import Profile from "./Profile/Profilepic";
import CallPage from "./home/CallPage";

function App() {
  const [authUser] = useAuth();

  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify-email" element={<VerifyEmail />} />

        {/* Protected Routes */}
        <Route
          path="/chat-page"
          element={authUser ? <Chatpage /> : <Navigate to="/login" />}
        />

        <Route
          path="/profile-page"
          element={authUser ? <Profile /> : <Navigate to="/login" />}
        />

        <Route
          path="/call/:id"
          element={authUser ? <CallPage /> : <Navigate to="/login" />}
        />

        <Route
          path="/help-page"
          element={authUser ? <HelpPage /> : <Navigate to="/login" />}
        />

        <Route
          path="/help-page-contact-page"
          element={authUser ? <Contact /> : <Navigate to="/login" />}
        />
      </Routes>

      {/* ✅ Toast notification container */}
      <ToastContainer position="top-center" autoClose={2000} theme="dark" />
    </>
  );
}

export default App;
