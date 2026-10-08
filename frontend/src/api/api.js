import axios from "axios";
import { clearAuth } from "./auth";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://hiremate-ai-m2ej.onrender.com";

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isUnauthorized = error.response?.status === 401;
    const isLoginRequest = error.config?.url?.includes("/auth/login");

    if (isUnauthorized && !isLoginRequest) {
      clearAuth();

      if (window.location.pathname !== "/login") {
        window.location.replace("/login");
      }
    }

    return Promise.reject(error);
  }
);

export default api;
