import api, { queryClient } from "@/lib/api";
import { useMutation, useQuery } from "@tanstack/react-query";
import { FormSchema } from "../schema/form";

export const useKeychains = (query?: any) => {
  return useQuery({
    queryKey: ["keychains", query],
    queryFn: () => api("/keychains", { query }),
    select: (i) => i.rows,
  });
};

export const useSaveKeychain = () => {
  return useMutation({
    mutationFn: async (body: FormSchema) => {
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
