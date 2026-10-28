
import axios from "axios";

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || "/api";
const BASE_URL = rawBaseUrl.replace(/\/+$/, "");
if (!import.meta.env.VITE_API_BASE_URL && import.meta.env.PROD) {
  console.warn(
    "VITE_API_BASE_URL is not set in production. Requests will default to /api and may fail if the backend is deployed separately."
  );
}

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});
