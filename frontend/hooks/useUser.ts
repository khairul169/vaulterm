import authRepo from "@/repositories/auth";
import { useQuery } from "@tanstack/react-query";

export const useUser = () => {
  const { data: user } = useQuery({
    queryKey: ["auth", "user"],
    queryFn: authRepo.getUser,
  });
  return user;
};
