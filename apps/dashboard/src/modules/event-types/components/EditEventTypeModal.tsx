"use client";

import { AlertCircle, Loader2, Save, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateEventTypeMutation } from "@/modules/event-types/hooks/useEventTypes";
import type {
  EventType,
  UpdateEventTypeState,
} from "@/modules/event-types/types";

interface EditEventTypeModalProps {
  isOpen: boolean;
  applicationId: string;
  eventType: EventType | null;
  onClose: () => void;
  onSuccess?: (updated: EventType) => void;
}

export function EditEventTypeModal({
  isOpen,
  applicationId,
  eventType,
  onClose,
  onSuccess,
}: EditEventTypeModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [fieldErrors, setFieldErrors] = useState<
    UpdateEventTypeState["errors"]
  >({});

  const mutation = useUpdateEventTypeMutation(applicationId);

  useEffect(() => {
    if (eventType) {
      setName(eventType.name);
      setDescription(eventType.description);
      setFieldErrors({});
    }
  }, [eventType]);

  if (!isOpen || !eventType) return null;

  const handleClose = () => {
    if (!mutation.isPending) {
      setFieldErrors({});
      onClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    try {
      const updated = await mutation.mutateAsync({
        eventTypeId: eventType.id,
        name,
        description,
      });
      if (updated && onSuccess) {
        onSuccess(updated);
      }
      handleClose();
    } catch (err: unknown) {
      const errorObj = err as UpdateEventTypeState;
      if (errorObj?.errors) {
        setFieldErrors(errorObj.errors);
      } else {
        setFieldErrors({
          _form: [(err as Error)?.message || "Failed to update event type."],
        });
      }
    }
  };

  const formErrorMessage =
    fieldErrors?._form?.[0] ||
    (mutation.isError && (mutation.error as Error)?.message);

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
      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-border bg-canvas p-6 shadow-xl animate-in fade-in zoom-in-95 sm:p-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Edit Event Type
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Update the name or description for this event type.
            </p>
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

        {/* Error Banner */}
        {formErrorMessage && (
          <div
            role="alert"
            className="mt-4 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive"
          >
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{formErrorMessage}</span>
          </div>
        )}

        {/* Edit Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="space-y-1.5">
            <Label
              htmlFor="edit-event-name"
              className="text-xs font-medium text-foreground"
            >
              Event Identifier <span className="text-destructive">*</span>
            </Label>
            <Input
              id="edit-event-name"
              name="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={mutation.isPending}
              aria-invalid={Boolean(fieldErrors?.name)}
              className="h-10 text-xs font-mono border-border bg-canvas placeholder:font-sans focus:border-primary focus:ring-ring"
            />
            {fieldErrors?.name && (
              <p className="text-xs text-destructive">{fieldErrors.name[0]}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="edit-event-description"
              className="text-xs font-medium text-foreground"
            >
              Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="edit-event-description"
              name="description"
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={mutation.isPending}
              aria-invalid={Boolean(fieldErrors?.description)}
              className="resize-none text-xs border-border bg-canvas focus:border-primary focus:ring-ring"
            />
            <p className="text-[11px] text-muted-foreground">
              Must be at least 10 characters long.
            </p>
            {fieldErrors?.description && (
              <p className="text-xs text-destructive">
                {fieldErrors.description[0]}
              </p>
            )}
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3">
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
              type="submit"
              disabled={mutation.isPending}
              className="h-9 px-4 text-xs font-medium text-primary-foreground bg-primary hover:bg-primary/90 border border-primary"
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="mr-1.5 h-3.5 w-3.5" />
                  <span>Save Changes</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
