import { useMutation, useQuery } from "@tanstack/react-query";
import { FormSchema } from "../schema/form";
import api from "@/lib/api";
import { useMemo } from "react";
import { useKeychains } from "@/pages/keychains/hooks/query";
import queryClient from "@/lib/queryClient";
import { useTeamId } from "@/stores/auth";
import { MoveHostPayload } from "../schema/query";

export const useHosts = (params: any = {}) => {
  const teamId = useTeamId();
  return useQuery({
    queryKey: ["hosts", teamId, params],
    queryFn: () => api("/hosts", { params: { teamId, ...params } }),
    select: (i) => i.rows,
  });
};

export const useKeychainsOptions = () => {
  const keys = useKeychains();
  const data = useMemo(() => {
    const items: any[] = keys.data || [];

    return items.map((key: any) => ({
      type: key.type,
      label: key.label,
      value: key.id,
    }));
  }, [keys.data]);

  return data;
};

export const useSaveHost = () => {
  const teamId = useTeamId();

  return useMutation({
    mutationFn: async (payload: FormSchema) => {
      const body = { teamId, ...payload };
      return body.id
        ? api(`/hosts/${body.id}`, { method: "PUT", body })
        : api(`/hosts`, { method: "POST", body });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hosts"] });
    },
  });
};

export const useMoveHost = () => {
  const teamId = useTeamId();

  return useMutation({
    mutationFn: (data: MoveHostPayload) => {
      const hostId = Array.isArray(data.hostId)
        ? data.hostId.join(",")
        : data.hostId;

      return api("/hosts/move", {
        method: "POST",
        body: { teamId, parentId: data.parentId, hostId },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hosts"] });
    },
  });
};

export const useTags = () => {
  const teamId = useTeamId();
  return useQuery({
    queryKey: ["hosts/tags", teamId],
    queryFn: () => api("/hosts/tags", { params: { teamId } }),
    select: (data) => {
      return data?.rows?.map((row: any) => ({
        label: row.name,
        value: row.name,
      }));
    },
  });
};
