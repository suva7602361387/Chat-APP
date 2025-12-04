import { getAuthUser } from "../lib/Auth";
import { useQuery } from "@tanstack/react-query";
const useAuthUser = () => {
  const authUser = useQuery({
    queryKey: ["authUser"],
    queryFn: getAuthUser,
    retry: false, // auth check
  });

  return { authUser: authUser.data?.user };
};
export default useAuthUser;