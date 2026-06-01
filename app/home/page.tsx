import { requireAuth } from "@/shared/lib/auth/server";
import { GlobalShell } from "@/shared/layout/global-shell";
import { HomeContent } from "@/features/workspace/components/home-content";

export default async function HomePage() {
  const session = await requireAuth();
  const user = session.user;

  return (
    <GlobalShell
      user={{
        firstName: user.firstName,
        lastName: user.lastName,
        avatarUrl: user.avatarUrl,
      }}
    >
      <HomeContent firstName={user.firstName} />
    </GlobalShell>
  );
}
