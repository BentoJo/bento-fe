"use client";

import { Bell, Mail } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { cn } from "@/shared/lib/utils";

/**
 * Notifications tab (design: image copy 15).
 *
 * TODO(BE): no notifications endpoint. Every toggle is UI-only and disabled —
 * no state is persisted and no fake data is shown.
 *
 * "@/shared/components/ui/switch" does not exist in this project (and we must
 * not run the shadcn CLI), so we render a small styled, disabled toggle.
 */

interface ToggleItem {
  id: string;
  label: string;
  description: string;
  /** Default visual state shown in the design (UI-only). */
  defaultOn?: boolean;
}

const EMAIL_NOTIFICATIONS: ToggleItem[] = [
  {
    id: "email-task-assigned",
    label: "Task Assigned",
    description: "Receive notification when a task is assigned to you.",
    defaultOn: true,
  },
  {
    id: "email-due-date",
    label: "Due Date Reminder",
    description: "Receive reminders before task deadlines.",
  },
  {
    id: "email-mention",
    label: "Mention Notifications",
    description: "Get notified when someone mentions you in a comment.",
    defaultOn: true,
  },
  {
    id: "email-sprint",
    label: "Sprint Updates",
    description: "Stay updated on sprint progress and changes.",
  },
  {
    id: "email-invites",
    label: "Workspace Invites",
    description: "Receive invitations to join workspaces and teams.",
    defaultOn: true,
  },
];

const IN_APP_NOTIFICATIONS: ToggleItem[] = [
  {
    id: "inapp-task-assigned",
    label: "Task Assigned",
    description: "Receive notification when a task is assigned to you.",
    defaultOn: true,
  },
  {
    id: "inapp-due-date",
    label: "Due Date Reminder",
    description: "Receive reminders before task deadlines.",
    defaultOn: true,
  },
  {
    id: "inapp-mention",
    label: "Mention Notifications",
    description: "Get notified when someone mentions you in a comment.",
    defaultOn: true,
  },
  {
    id: "inapp-sprint",
    label: "Sprint Updates",
    description: "Stay updated on sprint progress and status changes.",
  },
  {
    id: "inapp-status",
    label: "Status Change",
    description: "Receive notifications when a task status is updated.",
    defaultOn: true,
  },
  {
    id: "inapp-new-comment",
    label: "New Comment",
    description: "Get notified when new comments are added to your tasks.",
  },
  {
    id: "inapp-activity",
    label: "New Activity",
    description: "Stay informed about new activity and updates.",
    defaultOn: true,
  },
];

export function NotificationsTab() {
  return (
    <div className="flex flex-col gap-6">
      <Card className="bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <Mail className="size-5 text-primary" />
            Email Notifications
          </CardTitle>
          <CardDescription>
            Manage which emails updates and alerts you want to receive.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ToggleGrid items={EMAIL_NOTIFICATIONS} />
        </CardContent>
      </Card>

      <Card className="bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <Bell className="size-5 text-primary" />
            In-App Notifications
          </CardTitle>
          <CardDescription>
            Control notifications displayed inside your workspace.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ToggleGrid items={IN_APP_NOTIFICATIONS} />
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        Notification preferences are not editable yet — this is a preview.
      </p>
    </div>
  );
}

function ToggleGrid({ items }: { items: ToggleItem[] }) {
  return (
    <div className="grid grid-cols-1 gap-x-10 gap-y-6 md:grid-cols-2">
      {items.map((item) => (
        <ToggleRow key={item.id} item={item} />
      ))}
    </div>
  );
}

function ToggleRow({ item }: { item: ToggleItem }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <p className="text-sm font-medium text-card-foreground">
          {item.label}
        </p>
        <p className="text-xs text-muted-foreground">{item.description}</p>
      </div>
      {/* UI-only, disabled toggle — TODO(BE): no notifications endpoint. */}
      <span
        role="switch"
        aria-checked={Boolean(item.defaultOn)}
        aria-disabled="true"
        aria-label={item.label}
        className={cn(
          "relative inline-flex h-5 w-9 shrink-0 cursor-not-allowed items-center rounded-full opacity-60 transition-colors",
          item.defaultOn ? "bg-primary" : "bg-muted-foreground/30",
        )}
      >
        <span
          className={cn(
            "inline-block size-4 rounded-full bg-background shadow transition-transform",
            item.defaultOn ? "translate-x-4" : "translate-x-0.5",
          )}
        />
      </span>
    </div>
  );
}
