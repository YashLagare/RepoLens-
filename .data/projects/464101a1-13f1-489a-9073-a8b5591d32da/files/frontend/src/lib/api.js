import { axiosInstance } from "./axios";

export async function getStreamToken() {
  const response = await axiosInstance.get("/chat/token");
  return response.data;
}

export async function summarizeChannel(payload) {
  const response = await axiosInstance.post("/chat/summarize", payload);
  return response.data;
}
