import { z } from "zod";
import { createStore, useStore } from "zustand";

export const createDisclosure = <T>(data?: T | null) => {
  const store = createStore(() => ({
    open: false,
    data: data,
  }));

  const onOpen = (data?: T | null) => {
    store.setState({ open: true, data });
  };

  const onClose = () => {
    store.setState({ open: false });
  };

  const onOpenChange = (open: boolean) => {
    store.setState({ open });
  };

  const use = () => {
    const state = useStore(store);
    return { ...state, onOpen, onClose, onOpenChange };
  };

  return { store, use, onOpen, onClose, onOpenChange };
};

const hostnameRegex =
  /^(?:(?:[a-zA-Z0-9-]{1,63}\.?)+[a-zA-Z]{0,63}|(?:\d{1,3}\.){3}\d{1,3}|(?:[a-fA-F0-9:]+:+)+[a-fA-F0-9]+)$/;

export const isHostnameOrIP = (value?: string | null) => {
  return hostnameRegex.test(value || "");
};

export const hostnameShape = (message: string = "Invalid hostname") =>
  z.string().refine(isHostnameOrIP, { message });

export const formatDuration = (seconds: number) => {
  const days = Math.floor(seconds / (24 * 3600));
  seconds %= 24 * 3600;
  const hours = Math.floor(seconds / 3600);
  seconds %= 3600;
  const minutes = Math.floor(seconds / 60);
  seconds = Math.floor(seconds % 60);

  const parts = [];
  if (days > 0) parts.push(`${days} day${days > 1 ? "s" : ""}`);
  if (hours > 0) parts.push(`${hours} hr${hours > 1 ? "s" : ""}`);
  if (minutes > 0) parts.push(`${minutes} min`);
  if (seconds > 0) parts.push(`${seconds} sec`);

  return parts.join(" ") || "0 seconds";
};
