import { createStore, useStore } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import termSessionStore from "./terminal-sessions";

type AuthStore = {
  token?: string | null;
};

const authStore = createStore(
  persist<AuthStore>(
    () => ({
      token: null,
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

export const logout = () => {
  authStore.setState({ token: null });
  termSessionStore.setState({ sessions: [], curSession: 0 });
};

export default authStore;
