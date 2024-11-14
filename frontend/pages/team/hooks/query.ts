import api from "@/lib/api";
import { useMutation, useQuery } from "@tanstack/react-query";
import { InviteSchema, TeamFormSchema } from "../schema/team-form";
import queryClient from "@/lib/queryClient";
import { setTeam, useTeamId } from "@/stores/auth";
import { router } from "expo-router";

export const useTeams = () => {
  return useQuery({
    queryKey: ["teams"],
    queryFn: () => api("/teams"),
    select: (i) => i.rows,
  });
};

export const useTeam = () => {
  const teamId = useTeamId();
  return useQuery({
    queryKey: ["teams", teamId],
    queryFn: () => api(`/teams/${teamId}`),
  });
};

export const useSaveTeam = () => {
  return useMutation({
    mutationFn: async (body: TeamFormSchema) => {
      return body.id
        ? api(`/teams/${body.id}`, { method: "PUT", body })
        : api(`/teams`, { method: "POST", body });
    },
    onError: (e) => console.error(e),
    onSuccess: (res, body) => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });

      if (!body.id && res.id) {
        setTeam(res.id);
        router.push("/team");
      }
    },
  });
};

export const useInviteMutation = (teamId: string | null) => {
  return useMutation({
    mutationFn: async (body: InviteSchema) => {
      return api(`/teams/${teamId}/invite`, { method: "POST", body });
    },
    onError: (e) => console.error(e),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams", teamId] });
    },
  });
};
