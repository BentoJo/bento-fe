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
import { cairo } from "@/shared/lib/fonts";
import Email from "next-auth/providers/email";
import EmailIcon from "@/shared/components/svgs/EmailIcon";
import { Button } from "@/shared/components/ui/button";
import Notifications from "@/shared/components/svgs/Notification";
import DoneIcon from "@/shared/components/svgs/DoneIcon";
import { useState } from "react";





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

const initialSettings = [
  ...EMAIL_NOTIFICATIONS,
  ...IN_APP_NOTIFICATIONS,
].reduce(
  (acc, item) => ({
    ...acc,
    [item.id]: item.defaultOn ?? false,
  }),
  {}
);

export function NotificationsTab() {

  const [settings, setSettings] = useState(initialSettings);

  return (
    <Card className="overflow-hidden rounded-[12px] border border-[#E2E8F0] bg-white shadow-none">
      <CardContent className="p-0">

        {/* Email Notifications */}
        <section className="px-8 pt-8">
          <div className="mb-8">
            <div className="flex items-center gap-2">
              <EmailIcon className="size-5 text-[#334155]" />

              <h2
                className={`${cairo.className} text-[24px] font-bold text-[#0F172A]`}
              >
                Email Notifications
              </h2>
            </div>

            <p className="mt-1 pl-7 text-[12px] text-[#64748B]">
              Manage which email updates and alerts you want to receive.
            </p>
          </div>

          <ToggleGrid
            items={EMAIL_NOTIFICATIONS}
            settings={settings}
            setSettings={setSettings}
          />
        </section>

        <div className="mx-8 my-8 border-t border-[#E2E8F0]" />

        {/* In-App Notifications */}
        <section className="px-8 pb-8">
          <div className="mb-8">
            <div className="flex items-center gap-2">
              <Notifications className="size-5 text-[#0F172A]" fill="#0F172A" />

              <h2
                className={`${cairo.className} text-[24px] font-bold text-[#0F172A]`}
              >
                In-App Notifications
              </h2>
            </div>

            <p className="mt-1 pl-7 text-[12px] text-[#64748B]">
              Control notifications displayed inside your workspace.
            </p>
          </div>

          <ToggleGrid
            items={IN_APP_NOTIFICATIONS}
            settings={settings}
            setSettings={setSettings}
          />
        </section>

        <div className="border-t border-[#E2E8F0] px-8 py-4 mx-8">
          <div className="flex justify-end">

            <Button className="h-10 gap-2 rounded-[8px] bg-[#2563EB] pl-3 pr-4 text-white hover:bg-[#1D4ED8]">
              <DoneIcon />
              Save Notification Settings
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
function ToggleGrid({
  items,
  settings,
  setSettings,
}: {
  items: ToggleItem[];
  settings: Record<string, boolean>;
  setSettings: React.Dispatch<
    React.SetStateAction<Record<string, boolean>>
  >;
}) {
  return (
    <div className="relative grid grid-cols-2 gap-x-10 gap-y-8">
      {items.map((item) => (
        <ToggleRow
          key={item.id}
          item={item}
          enabled={settings[item.id]}
          onToggle={() =>
            setSettings((prev) => ({
              ...prev,
              [item.id]: !prev[item.id],
            }))
          }
        />
      ))}
    </div>
  );
}

function ToggleRow({
  item,
  enabled,
  onToggle,
}: {
  item: ToggleItem;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="max-w-[280px]">
        <p
          className={`${cairo.className} text-[14px] font-bold text-[#0F172A]`}
        >
          {item.label}
        </p>

        <p className="mt-1 text-[11px] leading-[16px] text-[#64748B]">
          {item.description}
        </p>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={onToggle}
        className={cn(
          "relative mt-1 h-6 w-12 shrink-0 rounded-full transition-colors",
          enabled ? "bg-[#2563EB]" : "bg-[#DBEAFE]"
        )}
      >
        <span
          className={cn(
            "absolute top-[3px] h-[18px] w-5 rounded-full bg-white transition-all",
           enabled ? "right-[2px]" : "left-[2px]"
          )}
        />
      </button>
    </div>
  );
}
