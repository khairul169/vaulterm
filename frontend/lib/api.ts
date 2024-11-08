import { ofetch } from "ofetch";

export const BASE_API_URL = process.env.EXPO_PUBLIC_API_URL || ""; //"http://10.0.0.100:3000";
export const BASE_WS_URL = BASE_API_URL.replace("http", "ws");

const api = ofetch.create({
  baseURL: BASE_API_URL,
});

export default api;
