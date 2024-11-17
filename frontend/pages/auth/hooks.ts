import { useMutation } from "@tanstack/react-query";
import {
  loginResultSchema,
  LoginSchema,
  loginSchema,
  RegisterSchema,
} from "./schema";
import authStore from "@/stores/auth";
import { router } from "expo-router";
import api from "@/lib/api";

export const useLoginMutation = () => {
  return useMutation({
    mutationFn: async (body: LoginSchema) => {
      const res = await api("/auth/login", { method: "POST", body });
      const { data } = loginResultSchema.safeParse(res);
      if (!data) {
        throw new Error("Invalid response!");
      }
      return data;
    },
    onSuccess(data) {
      authStore.setState({ token: data.sessionId });
      router.replace("/");
    },
  });
};

export const useRegisterMutation = () => {
  return useMutation({
    mutationFn: async (body: RegisterSchema) => {
      const res = await api("/auth/register", { method: "POST", body });
      const { data } = loginResultSchema.safeParse(res);
      if (!data) {
        throw new Error("Invalid response!");
      }
      return data;
    },
    onSuccess(data) {
      authStore.setState({ token: data.sessionId });
      router.replace("/");
    },
  });
};

export const useOAuthCallback = (type: string) => {
  return useMutation({
    mutationFn: async (code: string) => {
      const res = await api(`/auth/oauth/${type}/callback?code=${code}`);
      const { data } = loginResultSchema.safeParse(res);
      if (!data) {
        throw new Error("Invalid response!");
      }
      return data;
    },
    onSuccess(data) {
      authStore.setState({ token: data.sessionId });
      router.replace("/");
    },
  });
};
