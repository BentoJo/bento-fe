"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, useCallback, Suspense } from "react";
import { useAuth } from "@/shared/hooks/use-auth";
import { acceptInvite } from "@/features/workspace/api/workspace";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

function AcceptInviteContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [error, setError] = useState<string | null>(null);

  const handleAccept = useCallback(
    async (tokenValue: string) => {
      setStatus("loading");
      try {
        await acceptInvite({ token: tokenValue });
        setStatus("success");
        toast.success("Invitation accepted successfully");
        // Redirect to dashboard after a short delay
        setTimeout(() => router.push("/home"), 2000);
      } catch (err: any) {
        setStatus("error");
        setError(err.message || "Failed to accept invitation");
        if (tokenValue) toast.error(err.message || "Failed to accept invitation");
      }
    },
    [router],
  );

  useEffect(() => {
    if (isAuthLoading) return;

    if (!isAuthenticated) {
      // Save current URL with token for redirect back after login
      const currentUrl = window.location.pathname + window.location.search;
      router.push(`/auth/login?callbackUrl=${encodeURIComponent(currentUrl)}`);
      return;
    }

    if (token && status === "idle") {
      handleAccept(token);
    } else if (!token && status === "idle") {
      setStatus("error");
      setError("Invitation token is missing from the URL.");
    }
  }, [isAuthenticated, isAuthLoading, token, status, handleAccept, router]);

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-muted/30">
      <Card className="w-full max-w-md shadow-lg border-none">
        <CardHeader className="text-center space-y-1">
          <CardTitle className="text-2xl font-bold">Workspace Invitation</CardTitle>
          <CardDescription className="text-base">
            {status === "loading" && "Confirming your invitation..."}
            {status === "success" && "Welcome to the workspace!"}
            {status === "error" && "Oops! Invitation failed"}
            {status === "idle" && "Verifying your session..."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-10 space-y-6">
          {(status === "loading" || status === "idle") && (
            <Loader2 className="h-14 w-14 animate-spin text-primary" />
          )}
          {status === "success" && (
            <div className="flex flex-col items-center space-y-4 animate-in fade-in zoom-in duration-300">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
              <p className="text-center text-muted-foreground font-medium">
                You have successfully joined the workspace.
                <br />
                Redirecting you to your dashboard...
              </p>
            </div>
          )}
          {status === "error" && (
            <div className="flex flex-col items-center space-y-4 animate-in fade-in zoom-in duration-300">
              <AlertCircle className="h-16 w-16 text-destructive" />
              <p className="text-center text-destructive font-semibold">
                {error}
              </p>
              <Button
                variant="outline"
                onClick={() => router.push("/")}
                className="w-full mt-4"
              >
                Return Home
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center p-4 bg-muted/30">
          <Card className="w-full max-w-md border-none shadow-lg">
            <CardContent className="flex items-center justify-center py-24">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </CardContent>
          </Card>
        </div>
      }
    >
      <AcceptInviteContent />
    </Suspense>
  );
}
