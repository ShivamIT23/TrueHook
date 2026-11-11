"use client";

import { AlertCircle, Globe, Key, Loader2, Save, Tag, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EventTypeMultiSelect } from "@/modules/endpoints/components/EventTypeMultiSelect";
import type { EventType } from "@/modules/event-types/types";
import { useUpdateEndpointMutation } from "@/modules/endpoints/hooks/useEndpoints";
import type { Endpoint, UpdateEndpointState } from "@/modules/endpoints/types";

interface EditEndpointModalProps {
  isOpen: boolean;
  endpoint: Endpoint | null;
  applicationId: string;
  eventTypes?: EventType[];
  onClose: () => void;
  onSuccess?: (endpoint: Endpoint) => void;
}

export function EditEndpointModal({
  isOpen,
  endpoint,
  applicationId,
  eventTypes = [],
  onClose,
  onSuccess,
}: EditEndpointModalProps) {
  const [url, setUrl] = useState("");
  const [secret, setSecret] = useState("");
  const [enabled, setEnabled] = useState(true);
  const [selectedEventTypeIds, setSelectedEventTypeIds] = useState<string[]>([]);
  const [fieldErrors, setFieldErrors] = useState<UpdateEndpointState["errors"]>(
    {},
  );

  const mutation = useUpdateEndpointMutation(applicationId);

  useEffect(() => {
    if (endpoint) {
      setUrl(endpoint.url || "");
      setSecret(endpoint.secret_encrypted || "");
      setEnabled(endpoint.enabled ?? true);
      setSelectedEventTypeIds(endpoint.event_type_ids || []);
      setFieldErrors({});
    }
  }, [endpoint]);

  if (!isOpen || !endpoint) return null;

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
        endpointId: endpoint.id,
        url: url.trim(),
        secret: secret.trim() ? secret.trim() : undefined,
        enabled,
        event_type_ids: selectedEventTypeIds,
      });
      if (updated && onSuccess) {
        onSuccess(updated);
      }
      handleClose();
    } catch (err: unknown) {
      const errorObj = err as UpdateEndpointState;
      if (errorObj?.errors) {
        setFieldErrors(errorObj.errors);
      } else {
        setFieldErrors({
          _form: [(err as Error)?.message || "Failed to update endpoint."],
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
              Edit Webhook Endpoint
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Modify destination URL, secret, or active delivery status.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={mutation.isPending}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors disabled:opacity-50"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Global Error Banner */}
        {formErrorMessage && (
          <div className="mt-4 flex items-center gap-2.5 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <p>{formErrorMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {/* Destination URL */}
          <div className="space-y-1.5">
            <Label
              htmlFor="edit-endpoint-url"
              className="text-xs font-semibold text-foreground"
            >
              Endpoint URL
            </Label>
            <div className="relative">
              <Globe className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="edit-endpoint-url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={mutation.isPending}
                required
                className={`pl-9 font-mono text-xs ${
                  fieldErrors?.url
                    ? "border-destructive focus-visible:ring-destructive"
                    : "border-input"
                }`}
              />
            </div>
            {fieldErrors?.url && (
              <p className="text-[11px] font-medium text-destructive">
                {fieldErrors.url[0]}
              </p>
            )}
          </div>

          {/* Webhook Secret */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="edit-endpoint-secret"
                className="text-xs font-semibold text-foreground"
              >
                Signing Secret
              </Label>
              <span className="text-[11px] text-muted-foreground">
                Preserved if unchanged
              </span>
            </div>
            <div className="relative">
              <Key className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="edit-endpoint-secret"
                type="text"
                placeholder="whsec_..."
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                disabled={mutation.isPending}
                className={`pl-9 font-mono text-xs ${
                  fieldErrors?.secret
                    ? "border-destructive focus-visible:ring-destructive"
                    : "border-input"
                }`}
              />
            </div>
            {fieldErrors?.secret && (
              <p className="text-[11px] font-medium text-destructive">
                {fieldErrors.secret[0]}
              </p>
            )}
          </div>

          {/* Subscribed Event Types Multi-Select */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-foreground">
                Subscribed Event Types
              </Label>
              <span className="text-[11px] text-muted-foreground">
                {selectedEventTypeIds.length === 0
                  ? "No events will be sent"
                  : `${selectedEventTypeIds.length} selected`}
              </span>
            </div>
            <EventTypeMultiSelect
              applicationId={applicationId}
              eventTypes={eventTypes}
              selectedIds={selectedEventTypeIds}
              onChange={setSelectedEventTypeIds}
              disabled={mutation.isPending}
            />
            <p className="text-[11px] text-muted-foreground">
              Leaving this empty will not send any events to this endpoint.
              Select or create event types to receive deliveries.
            </p>
          </div>

          {/* Enabled Status Toggle */}
          <div className="pt-2">
            <label
              htmlFor="edit-endpoint-enabled"
              className="flex items-center justify-between p-3 rounded-lg border border-border bg-secondary/50 cursor-pointer hover:bg-secondary transition-colors"
            >
              <div>
                <p className="text-xs font-semibold text-foreground">
                  Delivery Enabled
                </p>
                <p className="text-[11px] text-muted-foreground">
                  When enabled, events matching this application will be
                  dispatched to this URL.
                </p>
              </div>
              <input
                id="edit-endpoint-enabled"
                type="checkbox"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
                disabled={mutation.isPending}
                className="h-4 w-4 rounded border-border text-primary focus:ring-ring"
              />
            </label>
          </div>

          {/* Modal Actions */}
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
              type="submit"
              disabled={mutation.isPending || !url.trim()}
              className="text-xs"
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-1.5 h-3.5 w-3.5" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
