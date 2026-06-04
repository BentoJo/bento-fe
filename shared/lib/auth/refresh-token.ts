import { AuthTokens } from "@/shared/types/auth-tokens";

export async function refreshAccessToken(): Promise<AuthTokens> {
  const endpoint = process.env.NEXT_PUBLIC_API_URL;

  if (!endpoint) {
    throw new Error("API endpoint is not defined in environment variables.");
  }

  const response = await fetch(`${endpoint}/v1/auth/refresh-token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to refresh access token.");
  }

  // The gateway wraps every response as { success, message, data }. Unwrap so
  // callers read accessToken/expiry at the top level (matching AuthTokens).
  const body = await response.json();
  return (body?.data ?? body) as AuthTokens;
}
