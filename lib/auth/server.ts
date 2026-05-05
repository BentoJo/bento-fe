import { getServerSession } from "next-auth";
import { nextAuthOptions } from "@/auth/next-auth";
import { redirect } from "next/navigation";

/**
 * SSR utility to get the current session
 * Use in Server Components to check authentication
 */
export async function getAuthSession() {
  return await getServerSession(nextAuthOptions);
}

/**
 * SSR utility to require authentication
 * Redirects to /auth/login if not authenticated
 * Use at the top of a Server Component to protect it
 */
export async function requireAuth() {
  const session = await getAuthSession();

  if (!session) {
    redirect("/auth/login");
  }

  return session;
}

/**
 * SSR utility to check if user is authenticated
 */
export async function isAuthenticated() {
  const session = await getAuthSession();
  return !!session;
}
