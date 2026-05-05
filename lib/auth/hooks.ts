"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Hook to get current session and loading state
 * Returns null if not authenticated
 */
export function useAuth() {
  const { data: session, status } = useSession();

  return {
    session,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
  };
}

/**
 * Hook to require authentication in a client component
 * Automatically redirects to /auth/login if not authenticated
 */
export function useRequireAuth() {
  const { session, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const isReady = !isLoading && isAuthenticated;

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [isLoading, isAuthenticated, router]);

  return {
    session,
    isReady,
    isLoading,
  };
}

/**
 * Simple hook to check if user is authenticated
 */
export function useIsAuthenticated() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated;
}
