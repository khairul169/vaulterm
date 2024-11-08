import { InteractiveSessionProps } from "@/components/containers/interactive-session";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type Session = InteractiveSessionProps & { id: string };

type TerminalSessionsStore = {
  sessions: Session[];
  curSession: number;
  push: (session: Session) => void;
  remove: (idx: number) => void;
  setSession: (idx: number) => void;
};

export const useTermSession = create(
  persist<TerminalSessionsStore>(
    (set) => ({
      sessions: [],
      curSession: 0,
      push: (session: Session) => {
        set((state) => ({
          sessions: [
            ...state.sessions,
            { ...session, id: session.id + "." + Date.now() },
          ],
          curSession: state.sessions.length,
        }));
      },
      remove: (idx: number) => {
        set((state) => {
          const sessions = [...state.sessions];
          sessions.splice(idx, 1);
          return { sessions, curSession: Math.min(idx, sessions.length - 1) };
        });
      },
      setSession: (idx: number) => {
        set({ curSession: idx });
      },
    }),
    { name: "term-sessions", storage: createJSONStorage(() => AsyncStorage) }
  )
);
