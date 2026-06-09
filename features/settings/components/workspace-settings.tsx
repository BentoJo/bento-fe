"use client";

import { Bell, MonitorSmartphone, Users, RefreshCw, Upload, ExternalLink, LogOut, Trash2, AlertCircle, LogInIcon, LogOutIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { RoleManagement } from "@/features/roles/components/role-management";
import { SessionsTab } from "@/features/settings/components/sessions-tab";
import { NotificationsTab } from "@/features/settings/components/notifications-tab";
import { cairo } from "@/shared/lib/fonts";
import WorkspaceIcon from "@/shared/components/svgs/WorkspaceIcon";
import { cn } from "@/shared/lib/utils";
import Alert from "@/shared/components/svgs/Alert";
import LogoutIcon from "@/shared/components/svgs/Logout";
import UploadIcon from "@/shared/components/svgs/Upload";
import DoneIcon from "@/shared/components/svgs/DoneIcon";
import Session from "@/shared/components/svgs/Session";
import Notifications from "@/shared/components/svgs/Notification";
import UsersIcon from "@/shared/components/svgs/UsersIcon";
import Notifications_Tab from "@/shared/components/svgs/Notification_Tab";


interface WorkspaceSettingsProps {
  workspaceId: string;
}

export function WorkspaceSettings({ workspaceId }: WorkspaceSettingsProps) {
  return (
    <div className={`${cairo.className} flex flex-col gap-4 p-6 bg-[#F8FAFC] min-h-screen`}>

      {/* ── Breadcrumb ── */}
      <nav className="flex items-center gap-1 text-[13px]">
        <span className="text-[#64748B] cursor-pointer hover:text-[#0F172A] transition-colors">Home</span>
        <span className="text-[#94A3B8] px-1">›</span>
        <span className="text-[#64748B] cursor-pointer hover:text-[#0F172A] transition-colors">Settings</span>
        <span className="text-[#94A3B8] px-1">›</span>
        <span className="text-[#2563EB] font-medium">Workspace</span>
      </nav>

      {/* ── Page heading ── */}
      <div className="flex flex-col gap-1">
        <h1 className="text-[26px] font-bold text-[#0F172A]">Workspace Settings</h1>
        <p className="text-[13px] text-[#64748B]">Manage your account preferences and security</p>
      </div>

      {/* ── Tabs ── */}
      <Tabs defaultValue="workspace" className="w-full">

        <TabsList
          variant="line"
          className="h-auto justify-start"
        >
          {[
            { value: "workspace", label: "Workspace", Icon: WorkspaceIcon },
            { value: "sessions", label: "Sessions & Devices", Icon: Session },
            { value: "notifications", label: "Notifications", Icon: Notifications_Tab},
            { value: "members", label: "Members & Permissions", Icon: UsersIcon },
          ].map(({ value, label, Icon }) => (
            <TabsTrigger
              key={value}
              value={value}
              className={cn(
                "gap-2 px-5 py-3.5 text-[16px] font-semibold rounded-none",
                value === "workspace" && "rounded-tl-[10px]"
              )}
            >
              <Icon className="size- shrink-0 text-[#2563EB]" fill="64748B" />
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="workspace" className="mt-5 flex flex-col gap-4">
          <WorkspaceInfoCard />
          <DangerZoneCard />
        </TabsContent>

        <TabsContent value="sessions" className="mt-5">
          <SessionsTab />
        </TabsContent>

        <TabsContent value="notifications" className="mt-5">
          <NotificationsTab />
        </TabsContent>

        <TabsContent value="members" className="mt-5">
          <RoleManagement workspaceId={workspaceId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ─────────────────────────────────────────
   Workspace Information Card
───────────────────────────────────────── */
function WorkspaceInfoCard() {
  return (
    <div
      className="rounded-[16px] bg-white p-6 flex flex-col gap-6"
      style={{ border: "1px solid #E2E8F0" }}
    >
      <h2 className={`text-[18px] font-bold text-[#0F172A]  ${cairo.className}`}>Workspace Information</h2>

      {/* ── Logo upload row ── */}
      <div className="flex items-center gap-6">
        {/* Logo preview */}
        <div
          className="flex items-center justify-center rounded-full overflow-hidden shrink-0"
          style={{
            width: 120,
            height: 120,
            background: "#F1F5F9",
            border: "1px solid #E2E8F0",
          }}
        >

          {/* Workspace Icon */}
          <p className="font-bold text-3xl">Bento</p>
        </div>

        {/* Upload controls */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              className={`gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold pr-6 pl-5 ${cairo.className} py-2 rounded-[8px] h-auto text-[16px]`}
            >
              <UploadIcon className="size-3.5" />
              Upload Logo
            </Button>
            <Button
              size="sm"
              variant="outline"
              className={`px-6 py-2 h-auto text-[16px] font-semibold  ${cairo.className} h-auto  hover:bg-[#EFF6FF]/80`}
            >
              Remove
            </Button>
          </div>
          <p className="text-[12px] text-[#94A3B8]">We support PNGs, JPEGs and GIFs under 2MB</p>
        </div>
      </div>

      {/* ── Divider ── */}
      <div className="h-px bg-[#F1F5F9]" />

      {/* ── Name + URL row ── */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label className={` ${cairo.className} text-[14px] font-bold text-[#0F172A]`}>Workspace Name</label>
          <Input
            defaultValue="ICIT Workspace"
            className="h-11 rounded-[8px] border-[#E2E8F0] border bg-[#F8FAFC] text-[14px] text-[#64748B] focus-visible:ring-[#2563EB]"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className={` ${cairo.className} text-[14px] font-bold text-[#0F172A]`}>Workspace URL</label>
          <div className="relative">
            <Input
              defaultValue="manejo.app/workspace/icit-workspace"
              className="h-11 rounded-[8px] border-[#E2E8F0] border bg-[#F8FAFC] text-[14px] text-[#64748B] focus-visible:ring-[#2563EB]"
              readOnly
            />
            <ExternalLink
              className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-[#64748B] cursor-pointer hover:text-[#2563EB]"
            />
          </div>
        </div>
      </div>

      {/* ── Description ── */}
      <div className="flex flex-col gap-2">
        <label className={` ${cairo.className} text-[14px] font-bold text-[#0F172A]`}>Description</label>
        <Textarea
          defaultValue="The ICIT Workspace is designed to help teams collaborate efficiently by organizing tasks, managing sprints, tracking project progress, and improving daily workflows in one centralized platform. Stay connected with your team, monitor ongoing activities, schedule important events, and keep every project structured and productive through an intuitive and modern workspace experience."
          rows={4}
          className="rounded-[8px] bg-[#F8FAFC] border-[#E2E8F0] text-[14px] text-[#64748B] resize-none focus-visible:ring-[#2563EB] leading-normal"
        />
      </div>

      {/* ── Action buttons ── */}
      <div className="flex justify-end gap-3 pt-2">
        <Button
          variant="outline"
          className={`px-6 py-2 h-auto text-[16px] font-semibold  ${cairo.className} h-auto  hover:bg-[#EFF6FF]/80`}
        >
          Cancel
        </Button>
        <Button
          className={`gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold pr-6 pl-5 ${cairo.className} py-2 rounded-[8px] h-auto text-[16px]`}
        >
          <DoneIcon className="size-3.5" />
          Save Changes
        </Button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Danger Zone Card
───────────────────────────────────────── */
function DangerZoneCard() {
  return (
    <div
      className="rounded-[16px] bg-white p-6 flex flex-col gap-5"
      style={{ border: "1.5px solid #FA4747" }}
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <Alert className="size-5 text-[#B30909]" />
        <h2 className={`text-[18px] ${cairo.className} font-bold text-[#B30909]`}>Danger Zone</h2>
      </div>

      <div className="flex items-center justify-between py-3 border-b border-[#F1F5F9]">
        <div className="flex flex-col gap-0.5">
          <span className={` ${cairo.className}  text-[16px] font-bold text-[#0F172A]`}>Exit Workspace</span>
          <span className="text-[12px] text-[#64748B]">Receive notifications when a task is assigned to you.</span>
        </div>
        <button className="p-2 rounded-lg hover:bg-[#FEF2F2] transition-colors">
          <LogoutIcon className="size-5 text-[#EF4444] " width={24} height={24} />
        </button>
      </div>

      {/* Delete Workspace row */}
      <div className="flex items-center justify-between py-1">
        <div className="flex flex-col gap-0.5">
          <span className={` ${cairo.className}  text-[16px] font-bold text-[#0F172A]`}>Delete Workspace</span>
          <span className="text-[12px] text-[#64748B]">Receive notifications when a task is assigned to you.</span>
        </div>
        <Button
          className={` gap-2 bg-[#D20C0C] ${cairo.className} hover:bg-[#D20C0C]/80 text-white font-bold px-5 py-2.5 h-auto text-[13px] rounded-[10px]`}
        >
          Delete Workspace
        </Button>
      </div>
    </div>
  );
}