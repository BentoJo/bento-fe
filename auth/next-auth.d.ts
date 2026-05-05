import "next-auth";
import type { UserInfo } from "../types/auth/index";

/**
 * Type augmentation for NextAuth
 * Extends the built-in Session and JWT interfaces with custom fields
 *
 * Reference: https://next-auth.js.org/getting-started/typescript
 */

declare module "next-auth" {
  interface Session {
    accessToken: string;
    refreshToken?: string; // Now stored in httpOnly cookie
    user: UserInfo;
    error?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken: string;
    refreshToken?: string;
    accessTokenExpiresAt: number;
    refreshTokenExpiresAt: number;
    user: UserInfo;
    error?: string;
  }
}
