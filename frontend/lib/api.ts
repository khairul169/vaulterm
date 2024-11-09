import { QueryClient } from "@tanstack/react-query";
import { ofetch } from "ofetch";

export const BASE_API_URL = process.env.EXPO_PUBLIC_API_URL || ""; //"http://10.0.0.100:3000";
export const BASE_WS_URL = BASE_API_URL.replace("http", "ws");

const api = ofetch.create({
  baseURL: BASE_API_URL,
  onResponseError: (error) => {
    if (error.response._data) {
      const message = error.response._data.message;
      throw new Error(message || "Something went wrong");
    }
  },
});

export const queryClient = new QueryClient();

export default api;
