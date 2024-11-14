import { getCurrentServer } from "@/stores/app";
import authStore, { logout } from "@/stores/auth";
import { ofetch } from "ofetch";

const api = ofetch.create({
  onRequest: (config) => {
    const server = getCurrentServer();
    if (!server) {
      throw new Error("No server selected");
    }

    // set server url
    config.options.baseURL = server.url;

    const { token, teamId } = authStore.getState();

    if (token) {
      config.options.headers.set("Authorization", `Bearer ${token}`);
    }
    if (teamId) {
      config.options.headers.set("X-Team-Id", teamId);
    }
  },
  onResponseError: (error) => {
    if (error.response.status === 401 && !!authStore.getState().token) {
      logout();
      throw new Error("Unauthorized");
    }

    if (error.response._data) {
      const message = error.response._data.message;
      throw new Error(message || "Something went wrong");
    }
  },
});

export default api;
