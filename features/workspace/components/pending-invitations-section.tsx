import Link from "next/link";
import { MailOpen } from "lucide-react";

import { cn } from "@/shared/lib/utils";

// TODO(BE): needs GET list-my-invitations endpoint.
// There is no "list my pending invitations" route on the gateway yet, so this
// rail renders an empty state only. Once the endpoint exists, fetch here and
// render invitation cards with Decline / Accept actions per the design.

interface PendingInvitationsSectionProps {
  className?: string;
}

export function PendingInvitationsSection({
  className,
}: PendingInvitationsSectionProps) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-border bg-card/40 p-5",
        className,
      )}
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <MailOpen className="size-4 text-muted-foreground" />
          Pending Invitations
        </h2>
        <Link
          href="/home"
          className="text-xs font-medium text-primary hover:underline"
          aria-disabled
        >
          View All
        </Link>
      </div>

      <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border px-4 py-10 text-center">
        <MailOpen className="size-6 text-muted-foreground/60" aria-hidden />
        <p className="text-sm font-medium text-foreground">
          No pending invitations
        </p>
        <p className="text-xs text-muted-foreground">
          Invitations to join workspaces will appear here.
        </p>
      </div>
    </section>
  );
}
