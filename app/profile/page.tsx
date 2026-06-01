import { requireAuth } from "@/shared/lib/auth/server";
import { GlobalShell } from "@/shared/layout/global-shell";
import { ProfileView } from "@/features/profile/components/profile-view";

export default async function ProfilePage() {
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
      <ProfileView
        user={{
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          avatarUrl: user.avatarUrl,
        }}
      />
    </GlobalShell>
  );
}
