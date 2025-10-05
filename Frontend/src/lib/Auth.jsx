import axios from "axios";
import { useAuth } from "../context/AuthProvider";
//const authUser=useAuth();
export const getAuthUser = async () => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/users/me`,
       {
       
        withCredentials: true,
      }
    );
    return res.data;
  } catch (error) {
    console.log("Error in getAuthUser:", error);
    return null;
  }
};
export async function getStreamToken() {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_BACKEND_URL}/api/v1/users/token`,
      {
        // headers: {
        //   Authorization: `Bearer ${authUser?.token}`,
        // },
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    console.log("Error in getStreamToken:", error);
    throw error;
  }
}