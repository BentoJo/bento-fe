import axios, { AxiosInstance } from "axios";
import { buildClientContextHeaders } from "@/shared/lib/device/headers";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export function createServerAxios(accessToken?: string): AxiosInstance {
  const headers: Record<string, string | null> = {
    "Content-Type": "application/json",
  };

  // Add device and client context headers
  const deviceHeaders = buildClientContextHeaders();
  Object.entries(deviceHeaders).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      headers[key] = String(value);
    }
  });

  const instance = axios.create({
    baseURL: API_URL,
    headers,
  });

  // Add access token to all requests if provided
  if (accessToken) {
    instance.interceptors.request.use((config) => {
      config.headers.Authorization = `Bearer ${accessToken}`;
      return config;
    });
  }

  return instance;
}

/**
 * Create a server-side axios instance with the access token from session
 * Used in SSR (Server Components) to make authenticated API calls
 */
export async function getServerAxios(accessToken: string): Promise<AxiosInstance> {
  return createServerAxios(accessToken);
}

/**
 * Create an unauthenticated server axios instance
 * Used for public endpoints like register, login, verify-otp before authentication
 */
export function getUnauthenticatedServerAxios(): AxiosInstance {
  return createServerAxios();
}
