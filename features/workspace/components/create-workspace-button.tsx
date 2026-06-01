"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { CreateWorkspaceDialog } from "@/features/workspace/components/create-workspace-dialog";
import type { WorkspaceResponse } from "@/shared/types/workspace";
import { Button } from "@/shared/components/ui/button";

interface CreateWorkspaceButtonProps {
  onCreated?: (workspace: WorkspaceResponse) => void;
  className?: string;
}

/**
 * Public entry point for creating a workspace. Renders a primary
 * "+ Create Workspace" button that opens the controlled dialog.
 */
export function CreateWorkspaceButton({
  onCreated,
  className,
}: CreateWorkspaceButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        onClick={() => setOpen(true)}
        className={className}
      >
        <Plus className="size-4" />
        Create Workspace
      </Button>
      <CreateWorkspaceDialog
        open={open}
        onOpenChange={setOpen}
        onCreated={onCreated}
      />
    </>
  );
}
