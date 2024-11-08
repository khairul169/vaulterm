import { createStore, useStore } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

type AuthStore = {
  token?: string | null;
};

const authStore = createStore(
  persist<AuthStore>(
    () => ({
      token: null,
    }),
    {
      name: "auth",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export const useAuthStore = () => {
  const state = useStore(authStore);
  return { ...state, isLoggedIn: state.token != null };
};

export default authStore;
