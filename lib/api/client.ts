import axios, { AxiosError, AxiosInstance, AxiosRequestHeaders } from "axios";
import { getSession } from "next-auth/react";
import { getHeadersForRequest } from "@/lib/device/headers";
import { refreshAccessToken } from "@/auth/refresh-token";
import type { AuthenticatedSession } from "@/types/auth/next-auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

let clientAxiosInstance: AxiosInstance | null = null;

export function createClientAxios(): AxiosInstance {
  if (!API_URL) {
    throw new Error(
      "API_URL is not defined. Please set NEXT_PUBLIC_API_URL in your environment variables.",
    );
  }

  const instance = axios.create({
    baseURL: API_URL,
    headers: {
      "Content-Type": "application/json",
    },
    withCredentials: true,
  });

  instance.interceptors.request.use(
    async (config) => {
      const session = (await getSession()) as AuthenticatedSession | null;
      if (session?.accessToken) {
        config.headers.Authorization = `Bearer ${session.accessToken}`;
      }

      const deviceHeaders = getHeadersForRequest();
      Object.entries(deviceHeaders).forEach(([key, value]) => {
        if (value) {
          config.headers[key] = value;
        }
      });

      return config;
    },
    (error) => Promise.reject(error),
  );

  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as AxiosError["config"] & {
        _retry?: boolean;
        headers: AxiosRequestHeaders;
      };

      // Only retry once to avoid infinite loops
      if (
        error.response?.status === 401 &&
        originalRequest &&
        !originalRequest._retry
      ) {
        originalRequest._retry = true;

        try {
          // Call refresh endpoint
          // - Sends refreshToken cookie (via credentials: include)
          // - Backend returns new tokens in cookies
          await refreshAccessToken();

          // Backend has set new cookies (refreshToken, accessToken via session)
          // Get updated session with new accessToken
          const session = (await getSession()) as AuthenticatedSession | null;

          if (session?.accessToken) {
            // Update authorization header with new token
            originalRequest.headers.Authorization = `Bearer ${session.accessToken}`;
            // Retry original request with new tokens
            return instance(originalRequest);
          }
        } catch (refreshError) {
          console.error("Token refresh failed:", refreshError);
          // Redirect to login would happen via middleware or caller
        }
      }

      return Promise.reject(error);
    },
  );

  return instance;
}

export function getClientAxios(): AxiosInstance {
  if (!clientAxiosInstance) {
    clientAxiosInstance = createClientAxios();
  }
  return clientAxiosInstance;
}
