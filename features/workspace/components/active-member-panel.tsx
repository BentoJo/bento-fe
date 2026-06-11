"use client";

import { Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { cairo } from "@/shared/lib/fonts";
import Timer from "@/shared/components/svgs/Timer";
import { useMembers } from "@/features/members/hooks/use-members";
import type { WorkspaceMember } from "@/features/members/types/member";
import type { WorkspaceRole } from "@/features/roles/types/role";

interface ActiveMembersPanelProps {
    workspaceId: string;
}

function formatJoinedAt(joinedAt: string): string {
    try {
        const date = new Date(joinedAt);
        const diffMs = Date.now() - date.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        if (diffDays === 0) return "Joined today";
        if (diffDays === 1) return "Joined 1 day ago";
        if (diffDays < 30) return `Joined ${diffDays} days ago`;
        const diffMonths = Math.floor(diffDays / 30);
        if (diffMonths === 1) return "Joined 1 month ago";
        return `Joined ${diffMonths} months ago`;
    } catch {
        return "Member";
    }
}

function resolveRoleName(authzRoleId: string, roles: WorkspaceRole[]): string {
    return roles.find((r) => r.authzRoleId === authzRoleId)?.roleName ?? "Member";
}

export function ActiveMembersPanel({ workspaceId }: ActiveMembersPanelProps) {
    const { members, roles, isLoading, error } = useMembers(workspaceId, { limit: 5 });

    return (
        <Card
            className="h-fit w-[460px] shadow-sm"
            style={{
                background: "#FFFFFF",
                border: "1px solid #E2E8F0",
                borderRadius: 16,
                padding: "4px 0",
            }}
        >
            {/* Header */}
            <CardHeader className="px-5 pt-5">
                <CardTitle
                    className={`${cairo.className} flex items-center gap-2 text-[22px] font-bold text-[#0F172A]`}
                >
                    <Users />
                    Active Members
                </CardTitle>
                <p className="text-[14px] text-[#64748B] leading-snug mt-1">
                    Contributors in your current workspace.
                </p>
            </CardHeader>

            {/* Member cards */}
            <CardContent className={`px-4 pb-4 pt-2 flex flex-col gap-2 text-[20px] font-bold ${cairo.className}`}>
                {isLoading ? (
                    <>
                        <MemberSkeleton />
                        <MemberSkeleton />
                        <MemberSkeleton />
                    </>
                ) : error ? (
                    <p className="text-[13px] text-[#64748B] px-1">
                        Could not load members.
                    </p>
                ) : members.length === 0 ? (
                    <p className="text-[13px] text-[#64748B] px-1">
                        No members yet.
                    </p>
                ) : (
                    members.map((member) => (
                        <MemberCard
                            key={member.id}
                            member={member}
                            roles={roles}
                        />
                    ))
                )}
            </CardContent>
        </Card>
    );
}

function MemberSkeleton() {
    return (
        <div
            className="flex flex-col rounded-[12px] px-3 pt-3 pb-2"
            style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}
        >
            <div className="flex items-center gap-3">
                <Skeleton className="w-16 h-16 rounded-full shrink-0" />
                <div className="flex flex-col gap-1.5">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                </div>
            </div>
            <div className="flex justify-end mt-1.5">
                <Skeleton className="h-3 w-24" />
            </div>
        </div>
    );
}

function MemberCard({
    member,
    roles,
}: {
    member: WorkspaceMember;
    roles: WorkspaceRole[];
}) {
    const firstName = member.user?.firstName ?? "";
    const lastName = member.user?.lastName ?? "";
    const name =
        [firstName, lastName].filter(Boolean).join(" ") ||
        member.user?.email ||
        member.userId;

    const roleName = resolveRoleName(member.authzRoleId, roles);
    const avatarUrl = member.user?.avatarUrl ?? "";
    const joinedLabel = formatJoinedAt(member.joinedAt);

    const initials =
        name
            .split(" ")
            .map((p) => p[0])
            .filter(Boolean)
            .slice(0, 2)
            .join("")
            .toUpperCase() || "?";

    return (
        <div
            className="flex flex-col rounded-[12px] px-3 pt-3 pb-2"
            style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}
        >
            {/* Top row: avatar + name/role */}
            <div className="flex items-center gap-3">
                <Avatar className="w-16 h-16 shrink-0" style={{ borderRadius: "50%" }}>
                    {avatarUrl ? (
                        <AvatarImage src={avatarUrl} alt={name} />
                    ) : null}
                    <AvatarFallback
                        className="text-xl font-bold"
                        style={{ background: "#DBEAFE", color: "#1D4ED8" }}
                    >
                        {initials}
                    </AvatarFallback>
                </Avatar>

                <div className="flex flex-col">
                    <span
                        className={`${cairo.className} text-[16px] font-bold text-[#0F172A] leading-tight`}
                    >
                        {name}
                    </span>
                    <span className="text-[12px] font-bold text-[#64748B] mt-0.5">
                        {roleName}
                    </span>
                </div>
            </div>

            {/* Joined row — bottom right */}
            <div className="flex justify-end items-center gap-1 mt-1.5">
                <Timer />
                <span
                    className="text-[12px] font-bold"
                    style={{ color: "#64748B" }}
                >
                    {joinedLabel}
                </span>
            </div>
        </div>
    );
}
