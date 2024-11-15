import { createStore, useStore } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type AppServer = {
  name?: string;
  url: string;
};

type AppStore = {
  localServer?: string | null;
  servers: AppServer[];
  curServer?: string | null;
};

const appStore = createStore(
  persist<AppStore>(
    () => ({
      localServer: null,
      servers: [],
      curServer: null,
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
    setCurrentServer(srv.url);
    return;
  }

  appStore.setState((state) => ({
    servers: [...state.servers, srv],
    curServer: setActive ? srv.url : state.curServer,
  }));
}

export function removeServer(idx: number) {
  appStore.setState((state) => ({
    servers: state.servers.filter((_, i) => i !== idx),
  }));
}

export function setCurrentServer(url: string) {
  appStore.setState({ curServer: url });
}

export function getCurrentServer() {
  return appStore.getState().curServer;
}

export function setLocalServer(url: string) {
  appStore.setState((state) => ({
    localServer: url,
    curServer:
      !state.curServer || state.curServer === state.localServer
        ? url
        : state.curServer,
  }));
}

export const useServer = () => {
  return useStore(appStore, (i) => i.curServer);
};

export default appStore;
