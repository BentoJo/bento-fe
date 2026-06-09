"use client";

import { useState, useEffect } from "react";
import { ArrowDown, ArrowUp, Edit2, Trash2, Check, X, Columns3, Loader2 } from "lucide-react";

import type { Column as ColumnType } from "@/features/boards/types/board";
import { useColumnActions } from "@/features/boards/hooks/use-column";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";

interface ManageColumnsDialogProps {
  workspaceId: string;
  boardId: string;
  columns: ColumnType[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  refetch: () => void;
}

export function ManageColumnsDialog({
  workspaceId,
  boardId,
  columns,
  open,
  onOpenChange,
  refetch,
}: ManageColumnsDialogProps) {
  const [editingColumnId, setEditingColumnId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [localColumns, setLocalColumns] = useState<ColumnType[]>([]);

  const { updateColumn, deleteColumn, bulkReorderColumns, isSubmitting } =
    useColumnActions(workspaceId, boardId, refetch);

  // Sync local columns when modal opens or columns prop changes
  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLocalColumns(columns.slice().sort((a, b) => a.position - b.position));
    }
  }, [open, columns]);

  const handleStartRename = (col: ColumnType) => {
    setEditingColumnId(col.id);
    setEditName(col.name);
  };

  const handleSaveRename = async (colId: string) => {
    if (!editName.trim()) return;
    const result = await updateColumn(colId, { name: editName.trim() });
    if (result) {
      setEditingColumnId(null);
      setEditName("");
    }
  };

  const handleDelete = async (colId: string) => {
    if (confirm("Are you sure you want to delete this column? All tasks in it may be affected.")) {
      await deleteColumn(colId);
    }
  };

  const handleMove = async (index: number, direction: "up" | "down") => {
    const nextIndex = direction === "up" ? index - 1 : index + 1;
    if (nextIndex < 0 || nextIndex >= localColumns.length) return;

    const reordered = [...localColumns];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(nextIndex, 0, moved);

    // Optimistically update local view
    setLocalColumns(reordered);

    // Perform bulk reorder on backend
    const payload = reordered.map((col, idx) => ({
      columnId: col.id,
      position: idx + 1,
    }));
    await bulkReorderColumns({ columns: payload });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <Columns3 className="size-5 text-primary" />
            Manage Columns
          </DialogTitle>
          <DialogDescription>
            Rename, reorder, or delete columns in this board.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 py-4 max-h-75 overflow-y-auto">
          {localColumns.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-6">
              No columns to manage.
            </p>
          ) : (
            localColumns.map((col, idx) => {
              const isEditing = editingColumnId === col.id;
              return (
                <div
                  key={col.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/20 p-2.5"
                >
                  {isEditing ? (
                    <div className="flex flex-1 items-center gap-2">
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="h-8 py-1"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") void handleSaveRename(col.id);
                          if (e.key === "Escape") setEditingColumnId(null);
                        }}
                      />
                      <Button
                        size="icon-sm"
                        onClick={() => void handleSaveRename(col.id)}
                        disabled={isSubmitting}
                      >
                        <Check className="size-3.5" />
                      </Button>
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        onClick={() => setEditingColumnId(null)}
                        disabled={isSubmitting}
                      >
                        <X className="size-3.5" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <span className="text-sm font-medium text-foreground truncate max-w-[180px]">
                        {col.name}
                      </span>
                      <div className="flex items-center gap-1">
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          title="Rename"
                          onClick={() => handleStartRename(col)}
                          disabled={isSubmitting}
                        >
                          <Edit2 className="size-3.5" />
                        </Button>
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          title="Move Up"
                          onClick={() => void handleMove(idx, "up")}
                          disabled={idx === 0 || isSubmitting}
                        >
                          <ArrowUp className="size-3.5" />
                        </Button>
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          title="Move Down"
                          onClick={() => void handleMove(idx, "down")}
                          disabled={idx === localColumns.length - 1 || isSubmitting}
                        >
                          <ArrowDown className="size-3.5" />
                        </Button>
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          title="Delete"
                          className="hover:text-destructive hover:bg-destructive/10 text-muted-foreground"
                          onClick={() => void handleDelete(col.id)}
                          disabled={isSubmitting}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-border pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              "Close"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
