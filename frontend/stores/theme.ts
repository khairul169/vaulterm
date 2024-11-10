import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Store = {
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
  toggle: () => void;
};

const useThemeStore = create(
  persist<Store>(
    (set) => ({
      theme: "dark",
      setTheme: (theme: "light" | "dark") => {
        set({ theme });
      },
      toggle: () => {
        set((state) => ({ theme: state.theme === "light" ? "dark" : "light" }));
      },
    }),
    {
      name: "vaulterm:theme",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useThemeStore;
