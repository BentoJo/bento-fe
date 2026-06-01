"use client";

import { useState } from "react";
import { Loader2, LogOut, Monitor, MonitorSmartphone } from "lucide-react";
import { signOut } from "next-auth/react";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { logoutAllDevices } from "@/features/settings/api/account";
import { getErrorMessage } from "@/shared/types/api/errors";

/**
 * Sessions & Devices tab (design: image copy 12).
 *
 * Backend reality: the device/session LIST is NOT exposed on the gateway.
 * TODO(BE): sessions/devices live in IAM, not exposed on gateway.
 * We render the layout with a graceful empty state for the device list and
 * wire the "Log Out All Devices" button to POST /v1/auth/logout-all.
 */
export function SessionsTab() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogoutAll() {
    setIsLoggingOut(true);
    try {
      await logoutAllDevices();
      toast.success("Logged out of all devices.");
      await signOut({ redirect: true, callbackUrl: "/" });
    } catch (err) {
      toast.error(getErrorMessage(err) || "Failed to log out of all devices.");
      setIsLoggingOut(false);
    }
  }

  return (
    <Card className="bg-card shadow-sm">
      <CardContent className="flex flex-col gap-8 p-6">
        {/* Active Session */}
        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-bold text-card-foreground">
            Active Session
          </h2>
          <div className="flex items-center justify-between gap-4 rounded-xl border border-border p-4">
            <div className="flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <Monitor className="size-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-card-foreground">
                  This device
                </p>
                <p className="text-xs text-muted-foreground">
                  Your current browser session
                </p>
              </div>
            </div>
            <span className="text-sm font-medium text-emerald-600">
              Current Device
            </span>
          </div>
        </section>

        {/* Connected Devices */}
        <section className="flex flex-col gap-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl font-bold text-card-foreground">
              Connected Devices
            </h2>
            <Button
              variant="secondary"
              className="gap-2 self-start text-primary sm:self-auto"
              onClick={handleLogoutAll}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <LogOut className="size-4" />
              )}
              Log Out All Devices
            </Button>
          </div>

          {/* Empty / coming-soon state — device list is not on the gateway. */}
          <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border py-12 text-center">
            <MonitorSmartphone className="size-8 text-muted-foreground/60" />
            <p className="text-sm font-medium text-card-foreground">
              Device list coming soon
            </p>
            <p className="max-w-sm text-xs text-muted-foreground">
              We can&apos;t show your connected devices here yet. You can still
              log out of every device using the button above.
            </p>
          </div>
        </section>
      </CardContent>
    </Card>
  );
}
