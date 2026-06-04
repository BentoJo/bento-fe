import "server-only";
import { cookies } from "next/headers";
import { AuthTokens } from "@/shared/types/auth-tokens";

/**
 * Server-side token refresh used by the NextAuth jwt callback.
 *
 * The refresh token lives in an httpOnly cookie, which a plain server-side
 * fetch does NOT send automatically. We forward the incoming request cookies
 * explicitly so the gateway can validate the session. (The client-side
 * refresh in `refresh-token.ts` relies on the browser sending cookies.)
 */
export async function refreshAccessTokenServer(): Promise<AuthTokens> {
  const endpoint = process.env.NEXT_PUBLIC_API_URL;
  if (!endpoint) {
    throw new Error("API endpoint is not defined in environment variables.");
  }

  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  const response = await fetch(`${endpoint}/v1/auth/refresh-token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieHeader,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to refresh access token.");
  }

  // The gateway wraps every response as { success, message, data }. Unwrap so
  // callers read accessToken/expiry at the top level (matching AuthTokens).
  const body = await response.json();
  return (body?.data ?? body) as AuthTokens;
}
