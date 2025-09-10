import React from 'react'
import { useEffect,useState } from 'react';
import Cookies from "js-cookie";
import axios from "axios";
function UseGetAllUser() {
    const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(false);
   useEffect(() => {
    const getUsers = async () => {
      setLoading(true);
      try {
        const token = Cookies.get("token");
        console.log("This is token",token);
        const response = await axios.get(`${process.env.VITE_BACKEND_URL}/api/v1/users/getuserProfile`, {
          credentials: "include",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setAllUsers(response.data);
        setLoading(false);
      } catch (error) {
        console.log("Error in useGetAllUsers: " + error);
      }
    };
    getUsers();
  }, []);
    return  [allUsers, loading];
}

export default UseGetAllUser
