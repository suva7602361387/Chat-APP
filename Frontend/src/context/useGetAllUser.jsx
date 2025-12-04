import React from 'react'
import { useEffect,useState } from 'react';
import Cookies from "js-cookie";
import axios from "axios";
import { useAuth } from './AuthProvider';
function UseGetAllUser() {
    const [allUsers, setAllUsers] = useState([]);
    const [authUser]=useAuth();
  const [loading, setLoading] = useState(false);
   useEffect(() => {
    const getUsers = async () => {
      setLoading(true);
      try {
        //const token = localStorage.getItem("ChatApp");
        const token=authUser.token;
       // console.log("This is token",authUser.token);
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/users/getuserProfile`, {
          credentials: "include",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setAllUsers(response.data);
        setLoading(false);
      } catch (error) {
        console.log(error);
        console.log("Error in useGetAllUsers: " + error);
      }
    };
    getUsers();
  }, []);
    return  [allUsers, loading];
}

export default UseGetAllUser
