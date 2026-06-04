"use client";

import { useState, useCallback } from "react";
import { signOut } from "next-auth/react";

import { Logout } from "@/features/auth/api/logout";
import { clearSessionData } from "@/shared/lib/auth/session";

/**
 * Full logout: revoke the session on the backend (best-effort), clear local
 * device data, then end the next-auth session and redirect to login.
 *
 * The backend call is best-effort — even if it fails (e.g. the access token is
 * already expired) we still tear down the client session so the user is never
 * stuck "logged in" on the frontend.
 */
export function useLogout(callbackUrl = "/auth/login") {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const logout = useCallback(async () => {
    setIsLoggingOut(true);
    try {
      await Logout();
    } catch (error) {
      console.warn("Backend logout failed; clearing client session anyway", error);
    } finally {
      clearSessionData();
      await signOut({ redirect: true, callbackUrl });
    }
  }, [callbackUrl]);

  return { logout, isLoggingOut };
}
