"use client";

import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useDeleteEndpointMutation } from "@/modules/endpoints/hooks/useEndpoints";
import type { Endpoint } from "@/modules/endpoints/types";

interface DeleteEndpointDialogProps {
  isOpen: boolean;
  endpoint: Endpoint | null;
  applicationId: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export function DeleteEndpointDialog({
  isOpen,
  endpoint,
  applicationId,
  onClose,
  onSuccess,
}: DeleteEndpointDialogProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mutation = useDeleteEndpointMutation(applicationId);

  if (!isOpen || !endpoint) return null;

  const handleClose = () => {
    if (!mutation.isPending) {
      setErrorMessage(null);
      onClose();
    }
  };

  const handleDelete = async () => {
    setErrorMessage(null);
    try {
      await mutation.mutateAsync(endpoint.id);
      if (onSuccess) {
        onSuccess();
      }
      handleClose();
    } catch (err: unknown) {
      setErrorMessage(
        (err as Error)?.message || "Failed to delete the endpoint.",
      );
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
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold tracking-tight text-foreground">
              Delete Webhook Endpoint?
            </h3>
            <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
              Are you sure you want to delete this endpoint? TrueHook will
              immediately stop sending webhook dispatches to:
            </p>
            <div className="mt-2 rounded-md border border-border bg-secondary/50 p-2 font-mono text-xs text-foreground break-all">
              {endpoint.url}
            </div>
            <p className="mt-2 text-xs text-destructive font-medium">
              This action is permanent and cannot be undone.
            </p>
          </div>
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
            disabled={mutation.isPending}
            className="text-xs"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={mutation.isPending}
            className="text-xs bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                Delete Endpoint
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
