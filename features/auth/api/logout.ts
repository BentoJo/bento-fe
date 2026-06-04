import { getClientAxios } from "@/shared/lib/api/client";
import { unwrap } from "@/shared/lib/api/unwrap";

export interface LogoutResponse {
  success: boolean;
  message: string;
}

/**
 * Revoke the current session on the backend.
 *
 * Sends the access token (Bearer, via the axios interceptor) and the
 * refreshToken httpOnly cookie (withCredentials). The gateway revokes the
 * session server-side and clears the refreshToken/sessionId cookies.
 */
export async function Logout(): Promise<LogoutResponse> {
  const axios = getClientAxios();
  const response = await axios.post("/v1/auth/logout");
  return unwrap<LogoutResponse>(response);
}
