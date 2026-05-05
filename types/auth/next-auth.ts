import type { Session } from "next-auth";
import type { JWT } from "next-auth/jwt";
import type { UserInfo } from "./index";

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
  refreshTokenExpiresAt: string;
}

export type AuthenticatedSession = Session & {
  accessToken: string;
  refreshToken?: string;
  error?: string;
};

export type AuthenticatedJWT = JWT & {
  accessToken: string;
  refreshToken?: string;
  accessTokenExpiresAt: number;
  refreshTokenExpiresAt: number;
  user: UserInfo;
  error?: string;
};

export interface CredentialsInput {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
  refreshTokenExpiresAt: string;
  user: string;
}

export type AuthorizedUser = UserInfo & {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
  refreshTokenExpiresAt: string;
};

export function parseCredentials(
  credentials: Record<string, unknown>,
): CredentialsInput {
  return {
    accessToken: String(credentials.accessToken || ""),
    refreshToken: String(credentials.refreshToken || ""),
    user: String(credentials.user || ""),
    accessTokenExpiresAt: String(credentials.accessTokenExpiresAt || ""),
    refreshTokenExpiresAt: String(credentials.refreshTokenExpiresAt || ""),
  };
}

export function parseUserFromCredentials(userString: string): UserInfo {
  try {
    return JSON.parse(userString) as UserInfo;
  } catch (error) {
    throw new Error("Invalid user data format in credentials" + error);
  }
}
