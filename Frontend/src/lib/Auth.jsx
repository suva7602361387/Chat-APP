import axios from "axios";
export const getAuthUser = async () => {
  try {
    const res = await axios.get(`${process.env.VITE_BACKEND_URL}/api/v1/users/me`);
    return res.data;
  } catch (error) {
    console.log("Error in getAuthUser:", error);
    return null;
  }
};
export async function getStreamToken() {
  const response = await axios.get("/api/v1/users/token");
  return response.data;
}