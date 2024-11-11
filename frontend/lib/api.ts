import { getCurrentServer } from "@/stores/app";
import authStore from "@/stores/auth";
import { QueryClient } from "@tanstack/react-query";
import { ofetch } from "ofetch";

const api = ofetch.create({
  onRequest: (config) => {
    const server = getCurrentServer();
    if (!server) {
      throw new Error("No server selected");
    }

    // set server url
    config.options.baseURL = server.url;

    const authToken = authStore.getState().token;
    if (authToken) {
      config.options.headers.set("Authorization", `Bearer ${authToken}`);
    }
  },
  onResponseError: (error) => {
    if (error.response.status === 401 && !!authStore.getState().token) {
      authStore.setState({ token: null });
      throw new Error("Unauthorized");
    }

    if (error.response._data) {
      const message = error.response._data.message;
      throw new Error(message || "Something went wrong");
    }
  },
});

export const queryClient = new QueryClient();

export default api;
