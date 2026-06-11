"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { listMembers } from "@/features/members/api/members";
import { transferWorkspaceOwnership } from "@/features/workspace/api/workspace";
import type { WorkspaceMember } from "@/features/members/types/member";
import { cairo } from "@/shared/lib/fonts";

interface TransferOwnershipDialogProps {
  workspaceId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TransferOwnershipDialog({
  workspaceId,
  open,
  onOpenChange,
}: TransferOwnershipDialogProps) {
  const router = useRouter();
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [confirming, setConfirming] = useState(false);
  const [transferring, setTransferring] = useState(false);

  useEffect(() => {
    if (!open) {
      setSelectedUserId("");
      setConfirming(false);
      return;
    }
    setLoadingMembers(true);
    listMembers(workspaceId, { page: 1, limit: 100 })
      .then((res) => setMembers(res.members))
      .catch(() => toast.error("Failed to load members."))
      .finally(() => setLoadingMembers(false));
  }, [open, workspaceId]);

  const selectedMember = members.find((m) => m.userId === selectedUserId);

  function getMemberDisplayName(member: WorkspaceMember): string {
    if (member.user) {
      return `${member.user.firstName} ${member.user.lastName}`.trim();
    }
    return member.userId;
  }

  async function handleConfirmTransfer() {
    if (!selectedUserId) return;
    setTransferring(true);
    try {
      await transferWorkspaceOwnership({
        workspaceId,
        newOwnerId: selectedUserId,
      });
      toast.success("Ownership transferred.");
      onOpenChange(false);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to transfer ownership.");
    } finally {
      setTransferring(false);
    }
  }

  // Confirmation step
  if (confirming && selectedMember) {
    const displayName = getMemberDisplayName(selectedMember);
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className={cairo.className}>
          <DialogHeader>
            <DialogTitle className="text-[18px] font-bold text-[#0F172A]">
              Confirm Transfer
            </DialogTitle>
            <DialogDescription className="text-[14px] text-[#64748B] mt-2">
              Are you sure you want to transfer ownership of this workspace to{" "}
              <span className="font-semibold text-[#0F172A]">{displayName}</span>? This
              action cannot be easily reversed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex gap-2 justify-end">
            <Button
              variant="outline"
              className={`px-6 py-2 h-auto text-[14px] font-semibold ${cairo.className} hover:bg-[#EFF6FF]/80`}
              onClick={() => setConfirming(false)}
              disabled={transferring}
            >
              Back
            </Button>
            <Button
              className={`bg-[#D20C0C] hover:bg-[#D20C0C]/80 text-white font-bold px-5 py-2.5 h-auto text-[14px] rounded-[10px] ${cairo.className}`}
              onClick={handleConfirmTransfer}
              disabled={transferring}
            >
              {transferring ? "Transferring…" : "Transfer Ownership"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Member selection step
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cairo.className}>
        <DialogHeader>
          <DialogTitle className="text-[18px] font-bold text-[#0F172A]">
            Transfer Ownership
          </DialogTitle>
          <DialogDescription className="text-[14px] text-[#64748B] mt-1">
            Select a workspace member to transfer ownership to.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          <label className={`block text-[14px] font-bold text-[#0F172A] mb-2 ${cairo.className}`}>
            New Owner
          </label>
          <Select
            value={selectedUserId}
            onValueChange={setSelectedUserId}
            disabled={loadingMembers}
          >
            <SelectTrigger className="h-11 rounded-[8px] border-[#E2E8F0] bg-[#F8FAFC] text-[14px] text-[#64748B]">
              <SelectValue placeholder={loadingMembers ? "Loading members…" : "Select a member"} />
            </SelectTrigger>
            <SelectContent>
              {members.map((member) => {
                const name = getMemberDisplayName(member);
                const email = member.user?.email ?? "";
                return (
                  <SelectItem
                    key={member.userId}
                    value={member.userId}
                    className="text-[14px]"
                  >
                    {email ? `${name} — ${email}` : name}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        <DialogFooter className="mt-4 flex gap-2 justify-end">
          <Button
            variant="outline"
            className={`px-6 py-2 h-auto text-[14px] font-semibold ${cairo.className} hover:bg-[#EFF6FF]/80`}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            className={`bg-[#D20C0C] hover:bg-[#D20C0C]/80 text-white font-bold px-5 py-2.5 h-auto text-[14px] rounded-[10px] ${cairo.className}`}
            disabled={!selectedUserId || loadingMembers}
            onClick={() => setConfirming(true)}
          >
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
