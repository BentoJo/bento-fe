"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AlertCircle, Sparkles, Trash2, Upload } from "lucide-react";

import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { Separator } from "@/shared/components/ui/separator";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

interface ProfileUser {
  firstName?: string;
  lastName?: string;
  email?: string;
  avatarUrl?: string | null;
}

const BIO_MAX = 180;

// Save + Delete have no gateway endpoint yet.
// TODO(BE): needs IAM user profile update + account delete on gateway.
const COMING_SOON = "Coming soon — not yet available on the gateway.";

function initials(user: ProfileUser): string {
  const f = user.firstName?.[0] ?? "";
  const l = user.lastName?.[0] ?? "";
  return (f + l).toUpperCase() || "U";
}

export function ProfileSettings({ user }: { user: ProfileUser }) {
  // Pre-fill from session where available; the rest start empty (no BE source).
  const [firstName, setFirstName] = useState(user.firstName ?? "");
  const [lastName, setLastName] = useState(user.lastName ?? "");
  const [email, setEmail] = useState(user.email ?? "");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");

  const fullName = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();

  // Profile-completion meter: fraction of the 7 editable fields filled.
  const completion = useMemo(() => {
    const fields = [firstName, lastName, email, birthDate, gender, phone, bio];
    const filled = fields.filter((v) => v.trim().length > 0).length;
    return Math.round((filled / fields.length) * 100);
  }, [firstName, lastName, email, birthDate, gender, phone, bio]);

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-8">
      {/* Breadcrumb + title */}
      <nav className="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
        <Link href="/home" className="hover:text-foreground">
          Home
        </Link>
        <span>/</span>
        <Link href="/profile" className="hover:text-foreground">
          Profile
        </Link>
        <span>/</span>
        <span className="text-primary">Profile Settings</span>
      </nav>
      <h1 className="mb-6 text-2xl font-bold text-foreground">
        Profile Settings
      </h1>

      {/* Completion banner */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border bg-primary/5 px-4 py-3">
        <p className="flex items-center gap-2 text-sm text-foreground">
          <Sparkles className="size-4 text-primary" />
          Complete your profile details to help others recognize you and improve
          your overall workspace experience.
        </p>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            Profile completion level
          </span>
          <span className="text-sm font-semibold text-primary">
            {completion}%
          </span>
          <div
            className="h-9 w-9 rounded-full"
            style={{
              background: `conic-gradient(var(--color-primary, currentColor) ${completion}%, var(--color-muted, #e5e7eb) ${completion}%)`,
            }}
            role="progressbar"
            aria-valuenow={completion}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Profile completion"
          />
        </div>
      </div>

      {/* Avatar + form card */}
      <Card className="p-6">
        {/* Profile picture */}
        <section>
          <h2 className="mb-4 text-base font-semibold text-foreground">
            Your profile picture
          </h2>
          <div className="flex flex-wrap items-center gap-4">
            <Avatar className="size-16">
              {user.avatarUrl ? (
                <AvatarImage src={user.avatarUrl} alt={fullName} />
              ) : null}
              <AvatarFallback className="text-lg">
                {initials(user)}
              </AvatarFallback>
            </Avatar>
            {/* TODO(BE): no avatar upload endpoint on gateway. */}
            <Button disabled title={COMING_SOON}>
              <Upload className="size-4" />
              Upload Photo
            </Button>
            <Button variant="outline" disabled title={COMING_SOON}>
              Remove Profile Picture
            </Button>
            <p className="w-full text-xs text-muted-foreground sm:w-auto">
              We support PNGs, JPEGs and GIFs under 2MB
            </p>
          </div>
        </section>

        <Separator className="my-6" />

        {/* Profile information */}
        <section>
          <h2 className="mb-4 text-base font-semibold text-foreground">
            Profile Information
          </h2>

          <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First name"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last name"
              />
            </div>

            {/* TODO(BE): birth date not stored on gateway. */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="birthDate">Birth Date</Label>
              <Input
                id="birthDate"
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
              />
            </div>

            {/* TODO(BE): gender not stored on gateway. */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="gender">Gender</Label>
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger id="gender" className="w-full">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                  <SelectItem value="prefer-not">
                    Prefer not to say
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>

            {/* TODO(BE): phone not stored on gateway. */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 555 000 0000"
              />
            </div>
          </div>

          {/* TODO(BE): bio not stored on gateway. */}
          <div className="mt-5 flex flex-col gap-1.5">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={bio}
              maxLength={BIO_MAX}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell others a bit about yourself..."
              rows={3}
            />
            <span className="text-xs text-muted-foreground">
              {bio.length}/{BIO_MAX} Character
            </span>
          </div>
        </section>

        <Separator className="my-6" />

        {/* Actions — disabled: no gateway endpoint. */}
        <div className="flex flex-wrap items-center justify-end gap-3">
          <Button variant="outline" asChild>
            <Link href="/profile">Cancel</Link>
          </Button>
          {/* TODO(BE): no user profile update endpoint on gateway. */}
          <Button disabled title={COMING_SOON}>
            Save Changes
          </Button>
        </div>
        <p className="mt-2 text-right text-xs text-muted-foreground">
          {COMING_SOON}
        </p>
      </Card>

      {/* Danger Zone */}
      <Card
        className={cn(
          "mt-6 border-destructive/40 p-6",
          "flex flex-row flex-wrap items-center justify-between gap-4",
        )}
      >
        <div>
          <h2 className="flex items-center gap-2 text-base font-semibold text-destructive">
            <AlertCircle className="size-4" />
            Danger Zone
          </h2>
          <p className="mt-1 text-sm font-medium text-foreground">
            Delete Account
          </p>
          <p className="text-sm text-muted-foreground">
            Permanently delete your account and all associated data.
          </p>
        </div>
        {/* TODO(BE): no account delete endpoint on gateway. */}
        <Button variant="destructive" disabled title={COMING_SOON}>
          <Trash2 className="size-4" />
          Delete Account
        </Button>
      </Card>
    </div>
  );
}
