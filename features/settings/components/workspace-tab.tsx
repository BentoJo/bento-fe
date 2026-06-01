"use client";

import { useEffect, useState } from "react";
import { AlertCircle, AlertTriangle, Loader2, Save, Trash2 } from "lucide-react";
import { signOut } from "next-auth/react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Separator } from "@/shared/components/ui/separator";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { useWorkspaceSettings } from "@/features/settings/hooks/use-workspace-settings";

interface WorkspaceTabProps {
  workspaceId: string;
}

export function WorkspaceTab({ workspaceId }: WorkspaceTabProps) {
  const {
    workspace,
    isLoading,
    loadError,
    isSaving,
    isDeleting,
    isTransferring,
    update,
    remove,
    transfer,
  } = useWorkspaceSettings(workspaceId);

  const [name, setName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");

  useEffect(() => {
    if (workspace) {
      setName(workspace.name ?? "");
      setLogoUrl(workspace.logoUrl ?? "");
    }
  }, [workspace]);

  const dirty =
    workspace != null &&
    (name.trim() !== (workspace.name ?? "") ||
      logoUrl.trim() !== (workspace.logoUrl ?? ""));

  async function handleSave() {
    const trimmed = name.trim();
    if (!trimmed) return;
    await update({
      name: trimmed,
      logoUrl: logoUrl.trim() || null,
    });
  }

  if (loadError) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        <AlertCircle className="size-4 shrink-0" />
        {loadError}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Card className="bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            General
          </CardTitle>
          <CardDescription>
            Update your workspace name and logo.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          {isLoading ? (
            <div className="flex flex-col gap-5">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-2">
                <Label htmlFor="ws-name">Workspace name</Label>
                <Input
                  id="ws-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="My workspace"
                  maxLength={120}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="ws-logo">Logo URL</Label>
                <Input
                  id="ws-logo"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://example.com/logo.png"
                  type="url"
                />
                <p className="text-xs text-muted-foreground">
                  Paste a direct image URL. Logo file upload is coming soon.
                </p>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={handleSave}
                  disabled={!dirty || isSaving || !name.trim()}
                  className="gap-2"
                >
                  {isSaving ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Save className="size-4" />
                  )}
                  Save changes
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card className="border-destructive/30 bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-destructive">
            <AlertTriangle className="size-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Irreversible and destructive actions for this workspace.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <TransferOwnershipRow
            isTransferring={isTransferring}
            onTransfer={transfer}
            disabled={isLoading}
          />

          <Separator />

          <DeleteWorkspaceRow
            workspaceName={workspace?.name}
            isDeleting={isDeleting}
            onDelete={remove}
            disabled={isLoading}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function TransferOwnershipRow({
  isTransferring,
  onTransfer,
  disabled,
}: {
  isTransferring: boolean;
  onTransfer: (newOwnerId: string) => Promise<boolean>;
  disabled: boolean;
}) {
  const [newOwnerId, setNewOwnerId] = useState("");

  async function handleTransfer() {
    const id = newOwnerId.trim();
    if (!id) return;
    const ok = await onTransfer(id);
    if (ok) setNewOwnerId("");
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border p-4">
      <div>
        <p className="text-sm font-medium text-card-foreground">
          Transfer ownership
        </p>
        <p className="text-xs text-muted-foreground">
          Hand this workspace to another member by their user ID. You will
          lose owner privileges.
        </p>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          value={newOwnerId}
          onChange={(e) => setNewOwnerId(e.target.value)}
          placeholder="New owner user ID"
          disabled={disabled || isTransferring}
        />
        <Button
          variant="outline"
          onClick={handleTransfer}
          disabled={disabled || isTransferring || !newOwnerId.trim()}
          className="gap-2 sm:w-auto"
        >
          {isTransferring ? (
            <Loader2 className="size-4 animate-spin" />
          ) : null}
          Transfer
        </Button>
      </div>
    </div>
  );
}

function DeleteWorkspaceRow({
  workspaceName,
  isDeleting,
  onDelete,
  disabled,
}: {
  workspaceName?: string;
  isDeleting: boolean;
  onDelete: () => Promise<boolean>;
  disabled: boolean;
}) {
  const [open, setOpen] = useState(false);

  async function handleConfirm() {
    const ok = await onDelete();
    if (ok) {
      setOpen(false);
      // Workspace no longer accessible — return the user to their workspaces.
      await signOut({ redirect: false }).catch(() => undefined);
      window.location.href = "/home";
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-medium text-destructive">
          Delete workspace
        </p>
        <p className="text-xs text-muted-foreground">
          Permanently delete this workspace and all of its data.
        </p>
      </div>
      <Button
        variant="destructive"
        className="gap-2"
        disabled={disabled || isDeleting}
        onClick={() => setOpen(true)}
      >
        <Trash2 className="size-4" />
        Delete
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete workspace?</DialogTitle>
            <DialogDescription>
              This will permanently delete
              {workspaceName ? ` "${workspaceName}"` : " this workspace"} and
              everything in it. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={isDeleting}>
                Cancel
              </Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={handleConfirm}
              disabled={isDeleting}
              className="gap-2"
            >
              {isDeleting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Trash2 className="size-4" />
              )}
              Delete workspace
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
