import { useMutation, useQuery } from "@tanstack/react-query";
import { FormSchema } from "../schema/form";
import api, { queryClient } from "@/lib/api";
import { useMemo } from "react";
import { useKeychains } from "@/pages/keychains/hooks/query";

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
  return useMutation({
    mutationFn: async (body: FormSchema) => {
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
