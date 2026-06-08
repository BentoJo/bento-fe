"use client";

import { Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { cairo } from "@/shared/lib/fonts";
import Timer from "@/shared/components/svgs/Timer";

/* ─────────────────────────────────────────
   Member type — edit or extend this array
   to add / change members
───────────────────────────────────────── */
type MemberStatus = "active" | "away" | "offline";

interface Member {
    name: string;
    role: string;
    avatar?: string;           // URL — leave empty for initials fallback
    status: MemberStatus;
    statusLabel: string;       // e.g. "Active now", "1 hour ago", "Offline"
}

// ✏️ Add, remove or edit members here
const MEMBERS: Member[] = [
    {
        name: "Omar Sabri",
        role: "Developer",
        avatar: "",
        status: "active",
        statusLabel: "Active now",
    },
    {
        name: "Maya Kim",
        role: "Content Writer",
        avatar: "",
        status: "active",
        statusLabel: "Active now",
    },
    {
        name: "Lina Zhao",
        role: "Designer",
        avatar: "",
        status: "away",
        statusLabel: "1 hour ago",
    },
    {
        name: "Raj Patel",
        role: "Product Manager",
        avatar: "",
        status: "away",
        statusLabel: "5 minutes ago",
    },
    {
        name: "Leo Chen",
        role: "Data Analyst",
        avatar: "",
        status: "offline",
        statusLabel: "Offline",
    },
];

/* ─────────────────────────────────────────
   Status colour map
───────────────────────────────────────── */
const STATUS_COLOR: Record<MemberStatus, string> = {
    active: "#16A34A",   // green
    away: "#64748B",     // slate  (matches "1 hour ago" / "5 minutes ago" in design)
    offline: "#64748B",  // slate
};

/* ─────────────────────────────────────────
   Component
───────────────────────────────────────── */
export function ActiveMembersPanel() {
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
                    Real-time presence of contributors in your<br />current workspace.
                </p>
            </CardHeader>

            {/* Member cards */}
            <CardContent className={`px-4 pb-4 pt-2 flex flex-col gap-2 text-[20px] font-bold ${cairo.className}`}>
                {MEMBERS.map((member) => (
                    <MemberCard key={member.name} member={member} />
                ))}
            </CardContent>
        </Card>
    );
}

/* ─────────────────────────────────────────
   Single member card
───────────────────────────────────────── */
function MemberCard({ member }: { member: Member }) {
    const initials = member.name
        .split(" ")
        .map((p) => p[0])
        .join("")
        .toUpperCase();

    const statusColor = STATUS_COLOR[member.status];

    return (
        <div
            className="flex flex-col rounded-[12px] px-3 pt-3 pb-2"
            style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}
        >
            {/* Top row: avatar + name/role */}
            <div className="flex items-center gap-3">
                <Avatar className="w-16 h-16 shrink-0" style={{ borderRadius: "50%" }}>
                    <AvatarImage src={member.avatar} alt={member.name} />
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
                        {member.name}
                    </span>
                    <span className="text-[12px] font-bold text-[#64748B] mt-0.5">
                        {member.role}
                    </span>
                </div>
            </div>

            {/* Status row — bottom right */}
            <div className="flex justify-end items-center gap-1 mt-1.5">
                {/* Clock icon */}
                <Timer />
                <span
                    className="text-[12px] font-bold"
                    style={{ color: statusColor }}
                >
                    {member.statusLabel}
                </span>
            </div>
        </div>
    );
}