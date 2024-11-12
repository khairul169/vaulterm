import { useMutation, useQuery } from "@tanstack/react-query";
import { FormSchema } from "../schema/form";
import api from "@/lib/api";
import { useMemo } from "react";
import { useKeychains } from "@/pages/keychains/hooks/query";
import queryClient from "@/lib/queryClient";
import { useTeamId } from "@/stores/auth";

export const useHosts = () => {
  const teamId = useTeamId();
  return useQuery({
    queryKey: ["hosts", teamId],
    queryFn: () => api("/hosts", { params: { teamId } }),
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
    onError: (e) => console.error(e),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hosts"] });
    },
  });
};
