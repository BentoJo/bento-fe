"use client";

import { Bell, Building2, MonitorSmartphone, Users } from "lucide-react";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";
import { RoleManagement } from "@/features/roles/components/role-management";
import { WorkspaceTab } from "@/features/settings/components/workspace-tab";
import { SessionsTab } from "@/features/settings/components/sessions-tab";
import { NotificationsTab } from "@/features/settings/components/notifications-tab";

interface WorkspaceSettingsProps {
  workspaceId: string;
}

/**
 * Workspace Settings page shell. Renders a tab bar
 * (Workspace | Sessions & Devices | Notifications | Members & Permissions)
 * and the matching panel for each tab.
 */
export function WorkspaceSettings({ workspaceId }: WorkspaceSettingsProps) {
  return (
    <div className="flex flex-col gap-6 p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <p className="text-xs text-muted-foreground">
          Home <span className="px-1">/</span> Settings
        </p>
        <h1 className="text-2xl font-semibold text-foreground">
          Workspace Settings
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage your account preferences and security
        </p>
      </div>

      <Tabs defaultValue="workspace" className="w-full">
        <TabsList className="h-auto w-full flex-wrap justify-start gap-1 rounded-xl border border-border bg-card p-1.5">
          <TabsTrigger value="workspace" className="flex-none gap-2 px-4 py-2">
            <Building2 className="size-4" />
            Workspace
          </TabsTrigger>
          <TabsTrigger value="sessions" className="flex-none gap-2 px-4 py-2">
            <MonitorSmartphone className="size-4" />
            Sessions &amp; Devices
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="flex-none gap-2 px-4 py-2"
          >
            <Bell className="size-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="members" className="flex-none gap-2 px-4 py-2">
            <Users className="size-4" />
            Members &amp; Permissions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="workspace" className="mt-6">
          <WorkspaceTab workspaceId={workspaceId} />
        </TabsContent>

        <TabsContent value="sessions" className="mt-6">
          <SessionsTab />
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <NotificationsTab />
        </TabsContent>

        <TabsContent value="members" className="mt-6">
          <RoleManagement workspaceId={workspaceId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
