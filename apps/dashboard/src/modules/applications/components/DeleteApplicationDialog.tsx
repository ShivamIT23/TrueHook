"use client";

import { AlertTriangle, Loader2, Trash2, X } from "lucide-react";
import { useState } from "react";
import { deleteApplicationAction } from "@/actions/applications";
import { Button } from "@/components/ui/button";
import { XButton } from "@/components/ui/x-button";
import { toast } from "@/components/ui/toast";
import type { Application } from "@/modules/applications/types";

interface DeleteApplicationDialogProps {
  isOpen: boolean;
  application: Application | null;
  onClose: () => void;
  onSuccess?: (deletedId: string) => void;
}

export function DeleteApplicationDialog({
  isOpen,
  application,
  onClose,
  onSuccess,
}: DeleteApplicationDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen || !application) return null;

  const handleClose = () => {
    if (!isDeleting) {
      setErrorMessage(null);
      onClose();
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setErrorMessage(null);

    try {
      const res = await deleteApplicationAction(application.id);
      if (!res.success) {
        throw new Error(res.message || "Failed to delete application.");
      }

      toast({
        message: `Application "${application.name}" deleted`,
        state: "success",
      });

      if (onSuccess) {
        onSuccess(application.id);
      }
      handleClose();
    } catch (err: unknown) {
      const msg = (err as Error)?.message || "Failed to delete application.";
      setErrorMessage(msg);
      toast({
        message: msg,
        state: "error",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <button
        type="button"
        tabIndex={-1}
        aria-label="Close dialog backdrop"
        className="fixed inset-0 bg-foreground/50 backdrop-blur-xs transition-opacity cursor-default border-0 p-0 m-0"
        onClick={handleClose}
      />

      {/* Dialog Card */}
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-border bg-canvas p-6 shadow-xl animate-in fade-in zoom-in-95 sm:p-7">
        <div className="flex items-start justify-between">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <XButton
            width={32}
            height={32}
            onClick={handleClose}
            borderStyle="none"
            aria-label="Close dialog"
            title="Close"
          >
            <X className="h-5 w-5" />
          </XButton>
        </div>

        <div className="mt-4">
          <h3 className="text-lg font-bold tracking-tight text-foreground">
            Delete Application?
          </h3>
          <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-foreground">
              {application.name}
            </span>
            ? This will permanently delete the application and all associated
            endpoints, events, and delivery records.
          </p>
          <div className="mt-3 rounded-lg border border-border bg-secondary2/50 p-2.5 font-mono text-xs text-muted-foreground">
            <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block mb-0.5">
              Application ID
            </span>
            <span className="text-foreground">{application.id}</span>
          </div>
          <p className="mt-3 text-xs text-destructive font-medium">
            This action is permanent and cannot be undone.
          </p>
        </div>

        {errorMessage && (
          <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
            {errorMessage}
          </div>
        )}

        <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-border">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isDeleting}
            className="text-xs h-9 bg-canvas"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-xs h-9 gap-1.5"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete Application</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
