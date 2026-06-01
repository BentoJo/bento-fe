import { requireAuth } from "@/shared/lib/auth/server";
import { GlobalShell } from "@/shared/layout/global-shell";
import { ProfileSettings } from "@/features/profile/components/profile-settings";

export default async function ProfileSettingsPage() {
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
      <ProfileSettings
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
