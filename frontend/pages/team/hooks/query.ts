import api from "@/lib/api";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  InviteSchema,
  SetRoleSchema,
  TeamFormSchema,
} from "../schema/team-form";
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
      return api(`/teams/${teamId}/members`, { method: "POST", body });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams", teamId] });
    },
  });
};

export const useSetRoleMutation = (teamId: string | null) => {
  return useMutation({
    mutationFn: async (body: SetRoleSchema) => {
      const url = `/teams/${teamId}/members/${body.userId}/role`;
      return api(url, { method: "PUT", body });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams", teamId] });
    },
  });
};

export const useRemoveMemberMutation = (teamId: string | null) => {
  return useMutation({
    mutationFn: async (id: string) => {
      return api(`/teams/${teamId}/members/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams", teamId] });
    },
  });
};
