"use client";

import { AlertTriangle, Loader2, Trash2, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useDeleteEventTypeMutation } from "@/modules/event-types/hooks/useEventTypes";
import type { EventType } from "@/modules/event-types/types";

interface DeleteEventTypeDialogProps {
  isOpen: boolean;
  applicationId: string;
  eventType: EventType | null;
  onClose: () => void;
  onSuccess?: (deletedId: string) => void;
}

export function DeleteEventTypeDialog({
  isOpen,
  applicationId,
  eventType,
  onClose,
  onSuccess,
}: DeleteEventTypeDialogProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const mutation = useDeleteEventTypeMutation(applicationId);

  if (!isOpen || !eventType) return null;

  const handleClose = () => {
    if (!mutation.isPending) {
      setErrorMessage(null);
      onClose();
    }
  };

  const handleDelete = async () => {
    setErrorMessage(null);

    try {
      await mutation.mutateAsync(eventType.id);
      if (onSuccess) {
        onSuccess(eventType.id);
      }
      handleClose();
    } catch (err: unknown) {
      setErrorMessage(
        (err as Error)?.message || "Failed to delete event type.",
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dimmed backdrop */}
      <button
        type="button"
        tabIndex={-1}
        aria-label="Close dialog backdrop"
        className="fixed inset-0 bg-foreground/50 backdrop-blur-xs transition-opacity cursor-default border-0 p-0 m-0"
        onClick={handleClose}
      />

      {/* Modal Dialog Card */}
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-border bg-canvas p-6 shadow-xl animate-in fade-in zoom-in-95 sm:p-7">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-foreground">
                Delete Event Type
              </h2>
              <p className="text-xs text-muted-foreground">
                This action cannot be undone.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={mutation.isPending}
            className="rounded-lg p-1 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {errorMessage && (
          <div
            role="alert"
            className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive"
          >
            {errorMessage}
          </div>
        )}

        <div className="mt-4 text-xs leading-relaxed text-muted-foreground">
          Are you sure you want to delete the event identifier{" "}
          <span className="font-mono font-semibold text-foreground bg-secondary px-1.5 py-0.5 rounded border border-border">
            {eventType.name}
          </span>
          ? Any active webhooks listening exclusively to this event type will no
          longer receive deliveries.
        </div>

        <div className="mt-6 flex items-center justify-end gap-2.5">
          <Button
            type="button"
            variant="outline"
            disabled={mutation.isPending}
            onClick={handleClose}
            className="h-9 px-4 text-xs font-medium text-muted-foreground border-border hover:bg-secondary hover:text-foreground"
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={mutation.isPending}
            onClick={handleDelete}
            className="h-9 px-4 text-xs font-medium text-destructive-foreground bg-destructive hover:bg-destructive/90 border border-destructive cursor-pointer"
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                <span>Delete Event Type</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
