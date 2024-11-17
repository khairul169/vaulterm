import api from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export const useServerConfig = (configName?: string | string[]) => {
  return useQuery({
    queryKey: ["server/config", configName],
    queryFn: () => {
      const keys = Array.isArray(configName)
        ? configName.join(",")
        : configName;
      return api("/server/config", { params: { keys } });
    },
    select: (data) => {
      return typeof configName === "string"
        ? (data[configName] as string)
        : data;
    },
  });
};
