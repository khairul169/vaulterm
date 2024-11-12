import api from "@/lib/api";
import { useMutation, useQuery } from "@tanstack/react-query";
import { FormSchema } from "../schema/form";
import queryClient from "@/lib/queryClient";
import { useTeamId } from "@/stores/auth";

export const useKeychains = (params?: any) => {
  const teamId = useTeamId();
  const query = { teamId, ...params };

  return useQuery({
    queryKey: ["keychains", query],
    queryFn: () => api("/keychains", { query }),
    select: (i) => i.rows,
  });
};

export const useSaveKeychain = () => {
  const teamId = useTeamId();

  return useMutation({
    mutationFn: async (payload: FormSchema) => {
      const body = { teamId, ...payload };
      return body.id
        ? api(`/keychains/${body.id}`, { method: "PUT", body })
        : api(`/keychains`, { method: "POST", body });
    },
    onError: (e) => console.error(e),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["keychains"] });
    },
  });
};
