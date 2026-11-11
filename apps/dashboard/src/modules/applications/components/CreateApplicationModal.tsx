"use client";

import { AlertCircle, Loader2, Plus, X } from "lucide-react";
import { useActionState, useEffect } from "react";
import { createApplicationAction } from "@/actions/applications";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  type Application,
  initialCreateApplicationState,
} from "@/modules/applications/types";

interface CreateApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (app: Application) => void;
}

export function CreateApplicationModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateApplicationModalProps) {
  const [state, formAction, isPending] = useActionState(
    createApplicationAction,
    initialCreateApplicationState,
  );

  useEffect(() => {
    if (state.success && state.application) {
      onSuccess(state.application);
      onClose();
    }
  }, [state.success, state.application, onSuccess, onClose]);

  if (!isOpen) return null;

  const formErrorMessage =
    state.errors?._form?.[0] || (!state.success && state.message);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dimmed backdrop */}
      <button
        type="button"
        tabIndex={-1}
        aria-label="Close dialog backdrop"
        className="fixed inset-0 bg-foreground/40 backdrop-blur-xs transition-opacity cursor-default border-0 p-0 m-0"
        onClick={() => !isPending && onClose()}
      />

      {/* Modal Dialog Card */}
      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-border bg-canvas p-6 shadow-xl animate-in fade-in zoom-in-95 sm:p-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Create Application
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Register a new logical source of webhook events.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
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

        {/* Creation Form */}
        <form action={formAction} className="mt-5 space-y-4">
          <div className="space-y-1.5">
            <Label
              htmlFor="app-name"
              className="text-xs font-medium text-foreground"
            >
              Application Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="app-name"
              name="name"
              required
              placeholder="e.g. Production Billing"
              aria-invalid={Boolean(state.errors?.name)}
              className="h-10 rounded-lg border-border bg-canvas px-3.5 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-ring aria-invalid:border-destructive"
            />
            {state.errors?.name && (
              <p className="text-xs text-destructive">{state.errors.name[0]}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="app-description"
              className="text-xs font-medium text-foreground"
            >
              Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="app-description"
              name="description"
              required
              rows={3}
              placeholder="At least 10 characters describing the purpose of this application..."
              aria-invalid={Boolean(state.errors?.description)}
              className="rounded-lg border-border bg-canvas p-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-ring aria-invalid:border-destructive"
            />
            {state.errors?.description ? (
              <p className="text-xs text-destructive">
                {state.errors.description[0]}
              </p>
            ) : (
              <p className="text-[11px] text-muted-foreground">
                Minimum 10 characters required
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="app-logo"
              className="text-xs font-medium text-foreground"
            >
              Logo URL{" "}
              <span className="text-muted-foreground font-normal">
                (Optional)
              </span>
            </Label>
            <Input
              id="app-logo"
              name="logo_url"
              type="url"
              placeholder="https://example.com/logo.png"
              aria-invalid={Boolean(state.errors?.logo_url)}
              className="h-10 rounded-lg border-border bg-canvas px-3.5 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-ring aria-invalid:border-destructive"
            />
            {state.errors?.logo_url && (
              <p className="text-xs text-destructive">
                {state.errors.logo_url[0]}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={onClose}
              className="h-9 cursor-pointer border-border bg-canvas px-4 text-xs font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="h-9 cursor-pointer border border-foreground bg-foreground px-4 text-xs font-medium text-canvas transition-colors hover:bg-foreground/90"
            >
              {isPending ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-canvas" />
                  <span>Creating...</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5">
                  <Plus className="h-3.5 w-3.5" />
                  <span>Create Application</span>
                </span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
