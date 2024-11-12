import { createStore, useStore } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import termSessionStore from "./terminal-sessions";
import queryClient from "@/lib/queryClient";

type AuthStore = {
  token: string | null;
  teamId: string | null;
};

const authStore = createStore(
  persist<AuthStore>(
    () => ({
      token: null,
      teamId: null,
    }),
    {
      name: "vaulterm:auth",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export const useAuthStore = () => {
  const state = useStore(authStore);
  return { ...state, isLoggedIn: state.token != null };
};

export const setTeam = (teamId: string | null) => {
  authStore.setState({ teamId });
  queryClient.invalidateQueries();
};

export const logout = () => {
  authStore.setState({ token: null, teamId: null });
  termSessionStore.setState({ sessions: [], curSession: 0 });
};

export const useTeamId = () => {
  return useStore(authStore, (i) => i.teamId);
};

export default authStore;
