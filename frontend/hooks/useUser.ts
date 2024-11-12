import authRepo from "@/repositories/auth";
import { useQuery } from "@tanstack/react-query";

export const useUser = () => {
  const { data: user } = useQuery({
    queryKey: ["auth", "user"],
    queryFn: authRepo.getUser,
  });

  if (!user) {
    return null;
  }

  function getTeamRole(teamId?: string | null) {
    if (!user.teams?.length) {
      return false;
    }
    const team = user.teams.find((i: any) => i.id === teamId);
    return team?.role;
  }

  function isInTeam(teamId?: string | null) {
    return getTeamRole(teamId) != null;
  }

  function teamCanWrite(teamId?: string | null) {
    const role = getTeamRole(teamId);
    return ["admin", "owner"].includes(role);
  }

  return {
    ...user,
    getTeamRole,
    isInTeam,
    teamCanWrite,
  };
};
