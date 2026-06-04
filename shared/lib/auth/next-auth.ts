import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { refreshAccessTokenServer } from "@/shared/lib/auth/refresh-token-server";
import type { NextAuthOptions } from "next-auth";
import type { JWT } from "next-auth/jwt";
import type { Session } from "next-auth";
import type {
  AuthenticatedSession,
  AuthenticatedJWT,
} from "@/shared/types/auth-tokens";
import {
  parseCredentials,
  parseUserFromCredentials,
} from "@/shared/types/auth-tokens";
import type { UserInfo } from "@/shared/types/auth";

export const nextAuthOptions: NextAuthOptions = {
  providers: [
    Credentials({
      credentials: {
        accessToken: { label: "Access Token", type: "text" },
        refreshToken: { label: "Refresh Token", type: "text" },
        user: { label: "User", type: "text" },
        accessTokenExpiresAt: {
          label: "Access Token Expires At",
          type: "text",
        },
        refreshTokenExpiresAt: {
          label: "Refresh Token Expires At",
          type: "text",
        },
      },

      async authorize(
        credentials,
      ): Promise<
        | (UserInfo & {
            accessToken: string;
            refreshToken: string;
            accessTokenExpiresAt: string;
            refreshTokenExpiresAt: string;
          })
        | null
      > {
        // This provider receives pre-verified tokens from the frontend
        // after OTP verification. No additional auth is needed here.
        if (!credentials) {
          throw new Error("Missing credentials.");
        }

        const parsed = parseCredentials(credentials);

        if (!parsed.accessToken || !parsed.user) {
          throw new Error("Missing required credentials.");
        }

        try {
          const user = parseUserFromCredentials(parsed.user);

          return {
            accessToken: parsed.accessToken,
            refreshToken: parsed.refreshToken,
            accessTokenExpiresAt: parsed.accessTokenExpiresAt,
            refreshTokenExpiresAt: parsed.refreshTokenExpiresAt,
            ...user,
          };
        } catch (error) {
          console.error("Error parsing user data:", error);
          throw new Error("Invalid credentials format.");
        }
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, user }): Promise<JWT> {
      if (user) {
        const userData = user as UserInfo & {
          accessToken: string;
          refreshToken: string;
          accessTokenExpiresAt: string;
          refreshTokenExpiresAt: string;
        };

        (token as AuthenticatedJWT).accessToken = userData.accessToken;
        (token as AuthenticatedJWT).refreshToken = userData.refreshToken;
        (token as AuthenticatedJWT).accessTokenExpiresAt =
          userData.accessTokenExpiresAt
            ? Number(userData.accessTokenExpiresAt)
            : 0;
        (token as AuthenticatedJWT).refreshTokenExpiresAt =
          userData.refreshTokenExpiresAt
            ? Number(userData.refreshTokenExpiresAt)
            : 0;
        (token as AuthenticatedJWT).user = {
          id: userData.id,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          avatarUrl: userData.avatarUrl,
        };

        return token;
      }

      const authToken = token as AuthenticatedJWT;

      // Refresh 60s BEFORE expiry so in-flight requests never carry a token that
      // expires mid-request. A missing/NaN expiry also forces a refresh (e.g. an
      // older token minted before expiry was an absolute timestamp).
      const REFRESH_SKEW_MS = 60_000;
      const expiresAtMs = authToken.accessTokenExpiresAt * 1000;
      const shouldRefresh =
        !Number.isFinite(expiresAtMs) ||
        Date.now() >= expiresAtMs - REFRESH_SKEW_MS;

      if (!shouldRefresh) {
        return token;
      }

      try {
        const refreshedTokens = await refreshAccessTokenServer();

        (token as AuthenticatedJWT).accessToken = refreshedTokens.accessToken;
        // The refresh token is rotated server-side via httpOnly cookie, not in
        // the body — only overwrite when the backend actually returns one.
        if (refreshedTokens.refreshToken) {
          (token as AuthenticatedJWT).refreshToken =
            refreshedTokens.refreshToken;
        }
        (token as AuthenticatedJWT).accessTokenExpiresAt = Number(
          refreshedTokens.accessTokenExpiresAt,
        );
        (token as AuthenticatedJWT).refreshTokenExpiresAt = Number(
          refreshedTokens.refreshTokenExpiresAt,
        );
        // Clear any stale refresh error after a successful refresh.
        (token as AuthenticatedJWT).error = undefined;

        return token;
      } catch {
        // Refresh can fail when the session/refresh-token is no longer valid
        // (e.g. revoked). Mark the token so the client can prompt re-login;
        // don't throw — that would crash any server component calling the session.
        (token as AuthenticatedJWT).error = "RefreshAccessTokenError";
        return token;
      }
    },

    async session({ session, token }): Promise<Session> {
      const authToken = token as AuthenticatedJWT;
      const authSession = session as AuthenticatedSession;

      authSession.accessToken = authToken.accessToken;
      authSession.refreshToken = authToken.refreshToken;
      authSession.user = authToken.user;
      authSession.error = authToken.error;

      return authSession;
    },
  },

  pages: {
    signIn: "/auth/login",
  },
};

export default NextAuth(nextAuthOptions);
