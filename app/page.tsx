import { getAuthSession } from "@/shared/lib/auth/server";
import { LandingPage } from "@/features/landing/components/landing-page";

export default async function Home() {
  const isAuthenticated = !!(await getAuthSession());

  return <LandingPage isAuthenticated={isAuthenticated} />;
}
