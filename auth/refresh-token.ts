import { AuthTokens } from "@/types/auth/next-auth";

export async function refreshAccessToken(): Promise<AuthTokens> {
  const endpoint = process.env.NEXT_PUBLIC_API_URL;

  if (!endpoint) {
    throw new Error("API endpoint is not defined in environment variables.");
  }

  const response = await fetch(`${endpoint}/auth/refresh-token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to refresh access token.");
  }

  return response.json();
}
