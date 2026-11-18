"use client";

import {
  AlertCircle,
  Check,
  Code,
  FileCode,
  Loader2,
  Plus,
  Send,
  Tag,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { XButton } from "@/components/ui/x-button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { EventType } from "@/modules/event-types/types";
import { usePublishEventMutation } from "@/modules/events/hooks/useEvents";
import type { EventDetail, PublishEventState } from "@/modules/events/types";

interface PublishEventModalProps {
  isOpen: boolean;
  applicationId: string;
  eventTypes: EventType[];
  onClose: () => void;
  onSuccess?: (event: EventDetail) => void;
}

const createSamplePayload = (eventName: string = "user.created") =>
  JSON.stringify(
    {
      event: eventName,
      data: {
        userId: "usr_1029384756",
        email: "developer@example.com",
        created_at: new Date().toISOString(),
      },
    },
    null,
    2,
  );

export function PublishEventModal({
  isOpen,
  applicationId,
  eventTypes,
  onClose,
  onSuccess,
}: PublishEventModalProps) {
  const initialEventType = eventTypes[0];
  const [selectedEventTypeId, setSelectedEventTypeId] = useState(
    initialEventType?.id || "",
  );
  const [payloadText, setPayloadText] = useState(() =>
    createSamplePayload(initialEventType?.name || "user.created"),
  );
  const [fieldErrors, setFieldErrors] = useState<PublishEventState["errors"]>({});
  const [jsonError, setJsonError] = useState<string | null>(null);

  const mutation = usePublishEventMutation(applicationId);

  const eventTypeOptions = eventTypes.map((et) => ({
    value: et.id,
    label: et.name,
    description: et.description,
  }));

  const selectedOption =
    eventTypeOptions.find((opt) => opt.value === selectedEventTypeId) ||
    eventTypeOptions[0] ||
    null;

  const updatePayloadEventName = (eventName: string) => {
    if (!eventName) return;
    setPayloadText((prev) => {
      try {
        const parsed = JSON.parse(prev);
        if (typeof parsed === "object" && parsed !== null) {
          if (parsed.event === eventName) return prev;
          parsed.event = eventName;
          return JSON.stringify(parsed, null, 2);
        }
      } catch (_err) {
        // Fallback to regex if JSON is invalid
      }

      if (/"event"\s*:\s*"[^"]*"/.test(prev)) {
        return prev.replace(/"event"\s*:\s*"[^"]*"/, `"event": "${eventName}"`);
      }

      return prev;
    });
  };

  useEffect(() => {
    if (isOpen && eventTypes.length > 0) {
      const exists = eventTypes.some((et) => et.id === selectedEventTypeId);
      const target = exists
        ? eventTypes.find((et) => et.id === selectedEventTypeId)!
        : eventTypes[0]!;

      if (!exists) {
        setSelectedEventTypeId(target.id);
      }

      updatePayloadEventName(target.name);
    }
  }, [isOpen, eventTypes]);

  const handleEventTypeChange = (
    opt: { value: string; label: string; description?: string } | null,
  ) => {
    const newId = opt ? opt.value : "";
    const newName = opt ? opt.label : "";
    setSelectedEventTypeId(newId);
    if (fieldErrors?.event_type_id) {
      setFieldErrors((prev) => ({ ...prev, event_type_id: undefined }));
    }

    if (newName) {
      updatePayloadEventName(newName);
    }
  };

  if (!isOpen) return null;

  const handleClose = () => {
    if (!mutation.isPending) {
      setFieldErrors({});
      setJsonError(null);
      onClose();
    }
  };

  const handleFormatJson = () => {
    try {
      const parsed = JSON.parse(payloadText);
      setPayloadText(JSON.stringify(parsed, null, 2));
      setJsonError(null);
    } catch (_err) {
      setJsonError("Invalid JSON: could not auto-format syntax");
    }
  };

  const handleResetSample = () => {
    const currentName = selectedOption?.label || eventTypes[0]?.name || "user.created";
    setPayloadText(createSamplePayload(currentName));
    setJsonError(null);
  };

  const handlePayloadChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setPayloadText(val);
    try {
      JSON.parse(val);
      setJsonError(null);
    } catch (_err) {
      // Don't show aggressive error immediately while typing unless user wants feedback
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setJsonError(null);

    const currentEventTypeId = selectedEventTypeId || eventTypes[0]?.id || "";
    if (!currentEventTypeId) {
      setFieldErrors({
        event_type_id: ["Please register and select an event type first."],
      });
      return;
    }

    try {
      JSON.parse(payloadText.trim());
    } catch (_err) {
      setJsonError("Payload must be valid RFC-8259 JSON format.");
      return;
    }

    try {
      const created = await mutation.mutateAsync({
        eventTypeId: currentEventTypeId,
        payloadJson: payloadText.trim(),
      });
      if (created && onSuccess) {
        onSuccess(created);
      }
      handleClose();
    } catch (err: unknown) {
      const errorObj = err as PublishEventState;
      if (errorObj?.errors) {
        setFieldErrors(errorObj.errors);
      } else {
        setFieldErrors({
          _form: [(err as Error)?.message || "Failed to publish event."],
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
      <div className="relative z-10 w-full max-w-xl rounded-2xl border border-border bg-canvas p-6 shadow-xl animate-in fade-in zoom-in-95 ">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
              <Send className="h-4 w-4" />
              <span>Publish Webhook Event</span>
            </div>
            <h2 className="mt-1 text-xl font-bold tracking-tight text-foreground">
              Emit Webhook Payload
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Send an event to your registered endpoints for automated HTTP
              delivery.
            </p>
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

        {formErrorMessage && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{formErrorMessage}</span>
          </div>
        )}

        {eventTypes.length === 0 ? (
          <div className="mt-6 rounded-xl border border-border bg-secondary2/50 p-4 text-xs text-foreground">
            <div className="flex items-center gap-2 font-semibold text-foreground">
              <AlertCircle className="h-4 w-4" />
              <span>No Event Types Configured</span>
            </div>
            <p className="mt-1 text-muted-foreground leading-relaxed">
              Events must be published against a defined Event Type schema. You
              currently have no registered event types.
            </p>
            <div className="mt-4">
              <Link href="/event-type" onClick={handleClose}>
                <Button size="sm" className="h-8 gap-1.5 text-xs">
                  <Plus className="h-3.5 w-3.5" />
                  <span>Create Event Type</span>
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {/* Event Type Selector */}
            <div className="space-y-1.5">
              <Label
                htmlFor="event_type_id"
                className="text-xs font-semibold text-foreground flex items-center gap-1.5"
              >
                <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Target Event Type</span>
              </Label>
              <Select
                id="event_type_id"
                options={eventTypeOptions}
                value={selectedOption}
                onChange={handleEventTypeChange}
                placeholder="Select an event type..."
                isSearchable
                className="w-full"
              />
              {fieldErrors?.event_type_id && (
                <p className="text-[11px] text-destructive">
                  {fieldErrors.event_type_id[0]}
                </p>
              )}
            </div>

            {/* Payload (JSON) Editor */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="payload"
                  className="text-xs font-semibold text-foreground flex items-center gap-1.5"
                >
                  <Code className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Payload Body (JSON)</span>
                </Label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleFormatJson}
                    className="text-[11px] text-primary hover:underline font-medium"
                  >
                    Format JSON
                  </button>
                  <span className="text-muted-foreground text-[10px]">•</span>
                  <button
                    type="button"
                    onClick={handleResetSample}
                    className="text-[11px] text-muted-foreground hover:text-foreground font-medium"
                  >
                    Sample Data
                  </button>
                </div>
              </div>

              <Textarea
                id="payload"
                rows={8}
                value={payloadText}
                onChange={handlePayloadChange}
                placeholder='{\n  "data": "value"\n}'
                className="font-mono text-xs leading-relaxed bg-canvas border-input rounded-xl focus:border-primary focus:ring-1 focus:ring-primary"
              />

              {jsonError && (
                <p className="text-[11px] text-destructive flex items-center gap-1 mt-1">
                  <AlertCircle className="h-3 w-3 shrink-0" />
                  <span>{jsonError}</span>
                </p>
              )}
              {fieldErrors?.payload && (
                <p className="text-[11px] text-destructive">
                  {fieldErrors.payload[0]}
                </p>
              )}
            </div>

            {/* Dialog Action Buttons */}
            <div className="mt-6 flex items-center justify-end gap-2.5 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleClose}
                disabled={mutation.isPending}
                className="h-9 px-4 text-xs bg-canvas"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={mutation.isPending || Boolean(jsonError)}
                className="h-9 gap-1.5 px-4 text-xs"
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Publishing...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5" />
                    <span>Publish Event</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
