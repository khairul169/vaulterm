import { createStore, useStore } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

type AppServer = {
  name?: string;
  url: string;
};

type AppStore = {
  servers: AppServer[];
  curServerIdx?: number | null;
};

const appStore = createStore(
  persist<AppStore>(
    () => ({
      servers: [],
      curServerIdx: null,
    }),
    {
      name: "vaulterm:app",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export function addServer(srv: AppServer, setActive?: boolean) {
  const curServers = appStore.getState().servers;
  const isExist = curServers.findIndex((s) => s.url === srv.url);

  if (isExist >= 0) {
    setActiveServer(isExist);
    return;
  }

  appStore.setState((state) => ({
    servers: [...state.servers, srv],
    curServerIdx: setActive ? state.servers.length : state.curServerIdx,
  }));
}

export function removeServer(idx: number) {
  appStore.setState((state) => ({
    servers: state.servers.filter((_, i) => i !== idx),
    curServerIdx: state.curServerIdx === idx ? null : state.curServerIdx,
  }));
}

export function setActiveServer(idx: number) {
  appStore.setState({ curServerIdx: idx });
}

export const useAppStore = () => {
  const state = useStore(appStore);
  const curServer =
    state.curServerIdx != null ? state.servers[state.curServerIdx] : null;

  return { ...state, curServer };
};

export default appStore;
