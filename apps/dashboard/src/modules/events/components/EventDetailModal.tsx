"use client";

import {
  AlertCircle,
  ArrowUpRight,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Globe,
  Layers,
  Send,
  X,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useEventDetailQuery } from "@/modules/events/hooks/useEvents";
import type { EventItem } from "@/modules/events/types";

interface EventDetailModalProps {
  isOpen: boolean;
  applicationId: string;
  event: EventItem | null;
  onClose: () => void;
}

export function EventDetailModal({
  isOpen,
  applicationId,
  event,
  onClose,
}: EventDetailModalProps) {
  const [copiedPayload, setCopiedPayload] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const eventId = event?.id || "";
  const { data: detailData, isLoading } = useEventDetailQuery(
    applicationId,
    eventId,
  );

  if (!isOpen || !event) return null;

  const currentEvent = detailData || event;
  const deliveries = detailData?.deliveries || [];

  const handleCopyPayload = () => {
    navigator.clipboard.writeText(
      JSON.stringify(currentEvent.payload, null, 2),
    );
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(currentEvent.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (Number.isNaN(d.getTime())) return "Recently";
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
      }).format(d);
    } catch {
      return dateStr;
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
        onClick={onClose}
      />

      {/* Modal Dialog Card */}
      <div className="relative z-10 w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-canvas p-6 shadow-xl animate-in fade-in zoom-in-95 sm:p-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                {currentEvent.event_type_name || "event"}
              </span>
              <span className="text-xs text-muted-foreground font-mono">
                {formatDate(currentEvent.created_at)}
              </span>
            </div>
            <h2 className="mt-2 text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              Event Details
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Metadata Grid */}
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-border bg-secondary/30 p-3.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block">
              Event Identifier
            </span>
            <div className="mt-1 flex items-center justify-between gap-2">
              <span className="font-mono text-xs text-foreground truncate select-all">
                {currentEvent.id}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleCopyId}
                className="h-6 px-1.5 text-xs text-muted-foreground hover:text-foreground"
              >
                {copiedId ? (
                  <Check className="h-3 w-3 text-primary" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-secondary/30 p-3.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block">
              Fanout Deliveries
            </span>
            <div className="mt-1 flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold text-foreground">
                {deliveries.length > 0
                  ? deliveries.length
                  : (currentEvent.deliveries_count ?? 0)}{" "}
                endpoints dispatched
              </span>
            </div>
          </div>
        </div>

        {/* Payload Section */}
        <div className="mt-6 border-t border-border pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Event Payload (JSON)
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopyPayload}
              className="h-7 gap-1.5 text-xs bg-canvas text-muted-foreground hover:text-foreground"
            >
              {copiedPayload ? (
                <>
                  <Check className="h-3 w-3 text-primary" />
                  <span>Copied JSON</span>
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  <span>Copy Payload</span>
                </>
              )}
            </Button>
          </div>
          <pre className="max-h-64 overflow-auto rounded-xl border border-border bg-secondary/25 p-4 font-mono text-xs text-foreground select-all leading-relaxed">
            {JSON.stringify(currentEvent.payload, null, 2)}
          </pre>
        </div>

        {/* Deliveries Fanout Section */}
        <div className="mt-6 border-t border-border pt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Layers className="h-4 w-4 text-primary" />
              Fanout Delivery Targets ({deliveries.length})
            </h3>
            <Link
              href="/deliveries"
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              <span>View in Deliveries</span>
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>

          {isLoading ? (
            <div className="rounded-xl border border-border bg-secondary/15 p-6 text-center">
              <p className="text-xs text-muted-foreground">
                Loading fanout deliveries telemetry...
              </p>
            </div>
          ) : deliveries.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-6 text-center">
              <p className="text-xs text-muted-foreground">
                No endpoint deliveries recorded for this event. Either no
                endpoints were registered and enabled for this event type, or
                processing is underway.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {deliveries.map((del) => {
                const isSuccess = del.status === "success";
                const isPending =
                  del.status === "pending" || del.status === "retrying";
                const isCopied = copiedUrl === del.endpoint_url;

                return (
                  <div
                    key={del.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-border bg-canvas p-3.5 shadow-2xs hover:bg-secondary/20 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs text-foreground truncate select-all">
                            {del.endpoint_url}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyUrl(del.endpoint_url)}
                            className="text-muted-foreground hover:text-foreground p-0.5"
                            title="Copy Endpoint URL"
                          >
                            {isCopied ? (
                              <Check className="h-3 w-3 text-primary" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </button>
                        </div>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          ID: {del.id}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                      <span className="text-xs text-muted-foreground">
                        {del.attempts} {del.attempts === 1 ? "attempt" : "attempts"}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider border ${
                          isSuccess
                            ? "bg-primary/10 text-primary border-primary/20"
                            : isPending
                              ? "bg-brass/10 text-brass border-brass/20"
                              : "bg-destructive/10 text-destructive border-destructive/20"
                        }`}
                      >
                        {isSuccess ? (
                          <CheckCircle2 className="h-3 w-3" />
                        ) : isPending ? (
                          <Clock className="h-3 w-3" />
                        ) : (
                          <XCircle className="h-3 w-3" />
                        )}
                        <span>{del.status}</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 flex justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="text-xs bg-canvas"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
