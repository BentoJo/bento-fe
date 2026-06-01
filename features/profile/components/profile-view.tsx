import Link from "next/link";
import {
  Briefcase,
  Building2,
  Calendar,
  CalendarDays,
  FileText,
  Mail,
  Pencil,
  Phone,
  Star,
  Users,
  VenusAndMars,
} from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Separator } from "@/shared/components/ui/separator";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";

interface ProfileUser {
  firstName?: string;
  lastName?: string;
  email?: string;
  avatarUrl?: string | null;
}

// Placeholder for any field the gateway does not yet expose.
// TODO(BE): needs IAM user profile on gateway.
const EMPTY = "—";

function initials(user: ProfileUser): string {
  const f = user.firstName?.[0] ?? "";
  const l = user.lastName?.[0] ?? "";
  return (f + l).toUpperCase() || "U";
}

function AboutRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Mail;
  label: string;
  value: string;
}) {
  const isEmpty = value === EMPTY;
  return (
    <div className="flex items-center gap-6 py-4">
      <div className="flex w-36 shrink-0 items-center gap-2 text-sm text-muted-foreground">
        <Icon className="size-4" />
        <span>{label}</span>
      </div>
      <div
        className={
          isEmpty
            ? "text-sm text-muted-foreground/60"
            : "text-sm font-medium text-foreground"
        }
      >
        {value}
      </div>
    </div>
  );
}

export function ProfileView({ user }: { user: ProfileUser }) {
  const fullName = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-8">
      {/* Breadcrumb + title */}
      <nav className="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
        <Link href="/home" className="hover:text-foreground">
          Home
        </Link>
        <span>/</span>
        <span className="text-primary">Profile</span>
      </nav>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-foreground">View Profile</h1>
        <Button asChild variant="outline" size="sm">
          <Link href="/profile/settings">
            <Pencil className="size-4" />
            Edit Profile
          </Link>
        </Button>
      </div>

      <Card className="p-6">
        {/* Header: avatar + name + meta */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <Avatar className="size-24 shrink-0">
            {user.avatarUrl ? (
              <AvatarImage src={user.avatarUrl} alt={fullName} />
            ) : null}
            <AvatarFallback className="text-2xl">
              {initials(user)}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-bold text-foreground">
              {fullName || EMPTY}
            </h2>
            {/* TODO(BE): job title + current workspace name not on gateway. */}
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground/60">
              <span className="flex items-center gap-1.5">
                <Briefcase className="size-4" />
                {EMPTY}
              </span>
              <span className="flex items-center gap-1.5">
                <Building2 className="size-4" />
                {EMPTY}
              </span>
            </div>
            {/* TODO(BE): bio not on gateway. */}
            <p className="mt-3 max-w-lg text-sm text-muted-foreground/60">
              No bio yet.
            </p>
          </div>
        </div>

        <Separator className="my-6" />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
          {/* About */}
          <section className="min-w-0">
            <h3 className="mb-2 text-base font-semibold text-foreground">
              About
            </h3>
            <div className="divide-y divide-border">
              {/* Real value from session. */}
              <AboutRow icon={Mail} label="Email" value={user.email || EMPTY} />
              {/* TODO(BE): the fields below need IAM user profile on gateway. */}
              <AboutRow icon={Briefcase} label="Job Title" value={EMPTY} />
              <AboutRow icon={Phone} label="Phone" value={EMPTY} />
              <AboutRow icon={Calendar} label="Birth Date" value={EMPTY} />
              <AboutRow icon={VenusAndMars} label="Gender" value={EMPTY} />
              <AboutRow icon={CalendarDays} label="Joined Date" value={EMPTY} />
              <AboutRow icon={FileText} label="Bio" value={EMPTY} />
            </div>
          </section>

          {/* Right rail: Current Workspace + Teams */}
          <aside className="flex flex-col gap-6">
            {/* TODO(BE): current workspace + favorite flag not on gateway. */}
            <section>
              <h3 className="mb-2 text-base font-semibold text-foreground">
                Current Workspace
              </h3>
              <Card className="gap-0 border-dashed p-4">
                <div className="flex items-start justify-between">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    <Building2 className="size-5" />
                  </div>
                  <Star className="size-4 text-muted-foreground/40" />
                </div>
                <p className="mt-3 text-sm font-medium text-muted-foreground/60">
                  {EMPTY}
                </p>
                <Badge variant="secondary" className="mt-2 w-fit">
                  Member
                </Badge>
                <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground/60">
                  <CalendarDays className="size-3.5" />
                  {EMPTY}
                </p>
              </Card>
            </section>

            {/* TODO(BE): team memberships not on gateway. */}
            <section>
              <h3 className="mb-2 text-base font-semibold text-foreground">
                Teams
              </h3>
              <div className="flex items-center gap-2 text-muted-foreground/60">
                <Users className="size-5" />
                <span className="text-sm">{EMPTY}</span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground/60">
                Member of 0 teams
              </p>
            </section>
          </aside>
        </div>
      </Card>
    </div>
  );
}
