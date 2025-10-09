
import React, { createContext, useContext, useState } from "react";
import Cookies from "js-cookie";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Try to get user from localStorage
  const storedUser = localStorage.getItem("ChatApp");
  let initialUserState;

  try {
    initialUserState = storedUser ? JSON.parse(storedUser) : null;
    //console.log("Auth",initialUserState)
  } catch (error) {
    console.error("Failed to parse user data:", error);
    initialUserState = null;
  }

  const [authUser, setAuthUser] = useState(initialUserState);
    const [signupData, setSignupData] = useState(null);

  return (
    <AuthContext.Provider value={[authUser, setAuthUser,signupData,setSignupData]}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
