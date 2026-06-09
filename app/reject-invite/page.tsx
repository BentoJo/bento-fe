"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, useCallback, Suspense } from "react";
import { rejectInvite } from "@/features/workspace/api/workspace";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Loader2, XCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

function RejectInviteContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [error, setError] = useState<string | null>(null);

  const handleReject = useCallback(async (tokenValue: string) => {
    setStatus("loading");
    try {
      await rejectInvite({ token: tokenValue });
      setStatus("success");
      toast.success("Invitation rejected successfully");
    } catch (err: any) {
      setStatus("error");
      setError(err.message || "Failed to reject invitation");
      toast.error(err.message || "Failed to reject invitation");
    }
  }, []);

  useEffect(() => {
    if (token && status === "idle") {
      handleReject(token);
    } else if (!token && status === "idle") {
      setStatus("error");
      setError("Invitation token is missing from the URL.");
    }
  }, [token, status, handleReject]);

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-muted/30">
      <Card className="w-full max-w-md border-none shadow-lg">
        <CardHeader className="text-center space-y-1">
          <CardTitle className="text-2xl font-bold">Workspace Invitation</CardTitle>
          <CardDescription className="text-base">
            {status === "loading" && "Processing your request..."}
            {status === "success" && "Invitation rejected"}
            {status === "error" && "Oops! Something went wrong"}
            {status === "idle" && "Initializing..."}
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
                The invitation has been rejected successfully.
              </p>
              <Button onClick={() => router.push("/")} className="w-full mt-4">
                Return Home
              </Button>
            </div>
          )}
          {status === "error" && (
            <div className="flex flex-col items-center space-y-4 animate-in fade-in zoom-in duration-300">
              <XCircle className="h-16 w-16 text-destructive" />
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

export default function RejectInvitePage() {
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
      <RejectInviteContent />
    </Suspense>
  );
}
