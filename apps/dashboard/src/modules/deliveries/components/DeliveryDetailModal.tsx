"use client";

import {
  AlertCircle,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Copy,
  Globe,
  Layers,
  Loader2,
  RefreshCw,
  Send,
  X,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  useDeliveryDetailQuery,
  useReplayDeliveryMutation,
} from "@/modules/deliveries/hooks/useDeliveries";
import type { DeliveryItem } from "@/modules/deliveries/types";

interface DeliveryDetailModalProps {
  isOpen: boolean;
  applicationId: string;
  delivery: DeliveryItem | null;
  onClose: () => void;
}

export function DeliveryDetailModal({
  isOpen,
  applicationId,
  delivery,
  onClose,
}: DeliveryDetailModalProps) {
  const [copiedPayload, setCopiedPayload] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [selectedAttemptId, setSelectedAttemptId] = useState<string | null>(null);

  const deliveryId = delivery?.id || "";
  const { data: detailData, isLoading } = useDeliveryDetailQuery(
    applicationId,
    deliveryId,
  );

  const replayMutation = useReplayDeliveryMutation(applicationId);

  if (!isOpen || !delivery) return null;

  const currentDelivery = detailData || delivery;
  const attempts = detailData?.attempts_list || [];

  const handleReplay = async () => {
    try {
      await replayMutation.mutateAsync(currentDelivery.id);
    } catch (_err) {
      // Handled by mutation state
    }
  };

  const handleCopyPayload = () => {
    if (detailData?.event_payload) {
      navigator.clipboard.writeText(
        JSON.stringify(detailData.event_payload, null, 2),
      );
      setCopiedPayload(true);
      setTimeout(() => setCopiedPayload(false), 2000);
    }
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(currentDelivery.endpoint_url);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(currentDelivery.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const isSuccess = currentDelivery.status === "success";
  const isPending =
    currentDelivery.status === "pending" ||
    currentDelivery.status === "retrying";

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
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider border ${
                  isSuccess
                    ? "bg-primary/10 text-primary border-primary/20"
                    : isPending
                      ? "bg-brass/10 text-brass border-brass/20"
                      : "bg-destructive/10 text-destructive border-destructive/20"
                }`}
              >
                {isSuccess ? (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                ) : isPending ? (
                  <Clock className="h-3.5 w-3.5" />
                ) : (
                  <XCircle className="h-3.5 w-3.5" />
                )}
                <span>{currentDelivery.status}</span>
              </span>

              <span className="inline-flex items-center rounded-full border border-border bg-secondary px-2.5 py-0.5 text-xs font-semibold text-foreground">
                {currentDelivery.event_type_name || "event"}
              </span>

              <span className="text-xs text-muted-foreground font-mono">
                {formatDate(currentDelivery.created_at)}
              </span>
            </div>
            <h2 className="mt-2 text-xl font-bold tracking-tight text-foreground">
              Delivery Telemetry
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleReplay}
              disabled={replayMutation.isPending}
              className="gap-1.5 text-xs bg-canvas text-muted-foreground hover:text-foreground"
            >
              {replayMutation.isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Replaying...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Replay</span>
                </>
              )}
            </Button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close dialog"
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Destination & Metadata Cards */}
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-border bg-secondary/30 p-3.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block">
              Destination Endpoint
            </span>
            <div className="mt-1 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="rounded bg-secondary border border-border px-1 py-0.5 text-[9px] font-bold text-muted-foreground uppercase font-mono shrink-0">
                  POST
                </span>
                <span className="font-mono text-xs text-foreground truncate select-all">
                  {currentDelivery.endpoint_url}
                </span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleCopyUrl}
                className="h-6 px-1.5 text-xs text-muted-foreground hover:text-foreground shrink-0"
              >
                {copiedUrl ? (
                  <Check className="h-3 w-3 text-primary" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-secondary/30 p-3.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block">
              Delivery Identifier
            </span>
            <div className="mt-1 flex items-center justify-between gap-2">
              <span className="font-mono text-xs text-foreground truncate select-all">
                {currentDelivery.id}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleCopyId}
                className="h-6 px-1.5 text-xs text-muted-foreground hover:text-foreground shrink-0"
              >
                {copiedId ? (
                  <Check className="h-3 w-3 text-primary" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Attempts Log Section */}
        <div className="mt-6 border-t border-border pt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              Delivery Attempts ({attempts.length})
            </h3>
            {currentDelivery.next_attempt_at && (
              <span className="text-xs text-brass font-medium flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                <span>Next attempt: {formatDate(currentDelivery.next_attempt_at)}</span>
              </span>
            )}
          </div>

          {isLoading ? (
            <div className="rounded-xl border border-border bg-secondary/20 p-6 text-center">
              <p className="text-xs text-muted-foreground">
                Loading attempt history and response telemetry...
              </p>
            </div>
          ) : attempts.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-6 text-center">
              <p className="text-xs text-muted-foreground">
                No delivery attempts have been recorded yet. Delivery status is currently pending.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {attempts.map((att) => {
                const isAttSuccess =
                  att.response_status &&
                  att.response_status >= 200 &&
                  att.response_status < 300;
                const isExpanded = selectedAttemptId === att.id;

                return (
                  <div
                    key={att.id}
                    className="rounded-xl border border-border bg-canvas overflow-hidden shadow-2xs transition-colors"
                  >
                    <div
                      className="flex items-center justify-between p-3.5 cursor-pointer hover:bg-secondary/25 transition-colors select-none"
                      onClick={() =>
                        setSelectedAttemptId(isExpanded ? null : att.id)
                      }
                    >
                      <div className="flex items-center gap-3">
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="font-semibold text-xs text-foreground">
                          Attempt #{att.attempt_number}
                        </span>
                        {att.response_status ? (
                          <span
                            className={`font-mono text-xs font-semibold px-2 py-0.5 rounded-full border ${
                              isAttSuccess
                                ? "bg-primary/10 text-primary border-primary/20"
                                : "bg-destructive/10 text-destructive border-destructive/20"
                            }`}
                          >
                            HTTP {att.response_status}
                          </span>
                        ) : (
                          <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-full bg-destructive/10 text-destructive border border-destructive/20">
                            Connection Failed
                          </span>
                        )}
                        {att.duration_ms !== null && att.duration_ms !== undefined && (
                          <span className="text-xs text-muted-foreground">
                            {att.duration_ms} ms
                          </span>
                        )}
                      </div>

                      <span className="text-xs text-muted-foreground font-mono">
                        {formatDate(att.created_at)}
                      </span>
                    </div>

                    {isExpanded && (
                      <div className="border-t border-border bg-secondary/15 p-4 space-y-3 text-xs animate-in fade-in-50">
                        {att.error_message && (
                          <div>
                            <span className="font-semibold text-destructive block mb-1 flex items-center gap-1">
                              <AlertCircle className="h-3.5 w-3.5" />
                              <span>Error Diagnostics:</span>
                            </span>
                            <p className="font-mono bg-destructive/10 border border-destructive/20 text-destructive p-2.5 rounded-lg leading-relaxed select-all">
                              {att.error_message}
                            </p>
                          </div>
                        )}

                        {att.response_body && (
                          <div>
                            <span className="font-semibold text-muted-foreground block mb-1">
                              HTTP Response Body:
                            </span>
                            <pre className="max-h-48 overflow-auto rounded-lg border border-border bg-canvas p-3 font-mono text-[11px] text-foreground select-all leading-relaxed">
                              {att.response_body}
                            </pre>
                          </div>
                        )}

                        {att.request_headers && (
                          <div>
                            <span className="font-semibold text-muted-foreground block mb-1">
                              Outgoing Request Headers:
                            </span>
                            <pre className="max-h-36 overflow-auto rounded-lg border border-border bg-canvas p-3 font-mono text-[11px] text-foreground select-all leading-relaxed">
                              {JSON.stringify(att.request_headers, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Event Payload */}
        {detailData?.event_payload && (
          <div className="mt-6 border-t border-border pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Original Event Payload
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
                    <span>Copy JSON</span>
                  </>
                )}
              </Button>
            </div>
            <pre className="max-h-56 overflow-auto rounded-xl border border-border bg-secondary/25 p-4 font-mono text-xs text-foreground select-all leading-relaxed">
              {JSON.stringify(detailData.event_payload, null, 2)}
            </pre>
          </div>
        )}

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
