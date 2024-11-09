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
