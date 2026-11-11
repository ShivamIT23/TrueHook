"use client";

import {
  Activity,
  AlertCircle,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  ExternalLink,
  Eye,
  Globe,
  Layers,
  Loader2,
  RefreshCw,
  Search,
  X,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Application } from "@/modules/applications/types";
import { DeliveryDetailModal } from "@/modules/deliveries/components/DeliveryDetailModal";
import {
  useDeliveriesQuery,
  useReplayDeliveryMutation,
} from "@/modules/deliveries/hooks/useDeliveries";
import type { DeliveryItem } from "@/modules/deliveries/types";

interface DeliveriesManagerProps {
  application: Application | null;
  initialDeliveries: DeliveryItem[];
  totalDeliveries: number;
}

export function DeliveriesManager({
  application,
  initialDeliveries,
  totalDeliveries,
}: DeliveriesManagerProps) {
  const applicationId = application?.id || "";

  const {
    data = { deliveries: initialDeliveries, total: totalDeliveries },
    isFetching,
    refetch,
  } = useDeliveriesQuery(applicationId, {
    deliveries: initialDeliveries,
    total: totalDeliveries,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [inspectingDelivery, setInspectingDelivery] =
    useState<DeliveryItem | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [replayingId, setReplayingId] = useState<string | null>(null);

  const replayMutation = useReplayDeliveryMutation(applicationId);

  const deliveries = data.deliveries || [];

  const handleCopyUrl = (e: React.MouseEvent, url: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => {
      setCopiedUrl(null);
    }, 2000);
  };

  const handleReplayClick = async (
    e: React.MouseEvent,
    delivery: DeliveryItem,
  ) => {
    e.stopPropagation();
    setReplayingId(delivery.id);
    try {
      await replayMutation.mutateAsync(delivery.id);
    } catch (_err) {
      // Ignored - handled by react-query mutation
    } finally {
      setReplayingId(null);
    }
  };

  const filteredDeliveries = deliveries.filter((del) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      del.id.toLowerCase().includes(q) ||
      del.endpoint_url.toLowerCase().includes(q) ||
      del.event_type_name.toLowerCase().includes(q);

    const matchesStatus =
      statusFilter === "all" || del.status.toLowerCase() === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const successCount = deliveries.filter((d) => d.status === "success").length;
  const failedCount = deliveries.filter((d) => d.status === "failed").length;
  const pendingCount = deliveries.filter(
    (d) => d.status === "pending" || d.status === "retrying",
  ).length;

  const successRate =
    deliveries.length > 0
      ? ((successCount / deliveries.length) * 100).toFixed(1)
      : "100.0";

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (Number.isNaN(d.getTime())) return "Recently";
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
      }).format(d);
    } catch {
      return dateStr;
    }
  };

  const getRelativeTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (Number.isNaN(d.getTime())) return "";
      const diffMs = Date.now() - d.getTime();
      const diffSecs = Math.floor(diffMs / 1000);
      if (diffSecs < 60) return "just now";
      const diffMins = Math.floor(diffSecs / 60);
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d ago`;
    } catch {
      return "";
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
            <Activity className="h-4 w-4" />
            <span>Delivery Telemetry & Pipeline</span>
          </div>
          <div className="mt-1 flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Webhook Deliveries
            </h1>
            {application && (
              <span className="flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                <Layers className="h-3 w-3" />
                {application.name}
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Inspect real-time HTTP delivery attempts, response status codes,
            latencies, and manual replay triggers.
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching || !applicationId}
            className="h-9 gap-1.5 text-xs text-muted-foreground hover:text-foreground bg-canvas"
            title="Refresh deliveries"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${isFetching ? "animate-spin text-primary" : ""}`}
            />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </div>

      {/* No Application Warning Banner */}
      {!application && (
        <div className="mt-6 rounded-xl border border-brass/40 bg-brass/10 p-4 text-sm text-foreground">
          <div className="flex items-center gap-2 font-semibold text-brass">
            <Layers className="h-4 w-4" />
            <span>No Application Context</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Please create or select an active application to view webhook
            delivery attempts.
          </p>
        </div>
      )}

      {/* Overview Metrics Cards */}
      {application && (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-border bg-canvas p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Total Deliveries
              </span>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">
              {deliveries.length}
            </p>
            <span className="text-[11px] text-muted-foreground">
              Dispatched endpoint targets
            </span>
          </div>

          <div className="rounded-xl border border-border bg-canvas p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Success Rate
              </span>
              <CheckCircle2 className="h-4 w-4 text-primary" />
            </div>
            <p className="mt-2 text-2xl font-bold tracking-tight text-primary">
              {successRate}%
            </p>
            <span className="text-[11px] text-muted-foreground">
              {successCount} of {deliveries.length} successful
            </span>
          </div>

          <div className="rounded-xl border border-border bg-canvas p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Failed Deliveries
              </span>
              <XCircle className="h-4 w-4 text-destructive" />
            </div>
            <p className="mt-2 text-2xl font-bold tracking-tight text-destructive">
              {failedCount}
            </p>
            <span className="text-[11px] text-muted-foreground">
              Delivery failures logged
            </span>
          </div>

          <div className="rounded-xl border border-border bg-canvas p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Pending / Retrying
              </span>
              <Clock className="h-4 w-4 text-brass" />
            </div>
            <p className="mt-2 text-2xl font-bold tracking-tight text-brass">
              {pendingCount}
            </p>
            <span className="text-[11px] text-muted-foreground">
              Scheduled or in flight
            </span>
          </div>
        </div>
      )}

      {/* Controls Bar */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by URL, event type, or delivery ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-canvas text-xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Status Segment Control */}
          <div className="flex items-center rounded-xl border border-border bg-secondary/40 p-1">
            {[
              { id: "all", label: "All", count: deliveries.length },
              { id: "success", label: "Success", count: successCount },
              { id: "failed", label: "Failed", count: failedCount },
              { id: "pending", label: "Pending", count: pendingCount },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-medium transition-colors ${
                  statusFilter === tab.id
                    ? "bg-canvas text-foreground shadow-2xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                    statusFilter === tab.id
                      ? "bg-secondary text-foreground"
                      : "bg-secondary/60 text-muted-foreground"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {(searchQuery || statusFilter !== "all") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("all");
              }}
              className="h-8 text-xs text-muted-foreground hover:text-foreground"
            >
              Clear filters
            </Button>
          )}
        </div>

        <div className="text-xs text-muted-foreground">
          Showing{" "}
          <span className="font-semibold text-foreground">
            {filteredDeliveries.length}
          </span>{" "}
          of {deliveries.length} deliveries
        </div>
      </div>

      {/* Deliveries Table */}
      <div className="mt-4">
        {filteredDeliveries.length === 0 ? (
          <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-canvas p-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary/80 text-muted-foreground">
              <Activity className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-foreground">
              {deliveries.length === 0
                ? "No webhook deliveries recorded yet"
                : "No deliveries match your filter"}
            </h3>
            <p className="mt-1 max-w-sm text-xs text-muted-foreground leading-relaxed">
              {deliveries.length === 0
                ? "Publish a webhook event to see automated dispatches and HTTP attempts in this log."
                : "Try adjusting your search query or status filter to see other deliveries."}
            </p>
            {deliveries.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                }}
                className="mt-4 text-xs bg-canvas"
              >
                Reset Filters
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border bg-canvas shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-secondary/30 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Event Type</th>
                    <th className="py-3 px-4">Destination Endpoint</th>
                    <th className="py-3 px-4">Attempts</th>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-xs">
                  {filteredDeliveries.map((del) => {
                    const isSuccess = del.status === "success";
                    const isPending =
                      del.status === "pending" || del.status === "retrying";
                    const isCopied = copiedUrl === del.endpoint_url;
                    const isReplaying = replayingId === del.id;
                    const relativeTime = getRelativeTime(del.created_at);

                    return (
                      <tr
                        key={del.id}
                        className="hover:bg-secondary/25 transition-colors cursor-pointer group"
                        onClick={() => setInspectingDelivery(del)}
                      >
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider border ${
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
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="font-semibold text-foreground">
                            {del.event_type_name || "event"}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 max-w-sm sm:max-w-md">
                          <div className="flex items-center gap-2">
                            <span className="rounded bg-secondary/80 border border-border/80 px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground uppercase font-mono">
                              POST
                            </span>
                            <span className="font-mono text-muted-foreground truncate select-all">
                              {del.endpoint_url}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => handleCopyUrl(e, del.endpoint_url)}
                              className="rounded p-1 text-muted-foreground opacity-60 group-hover:opacity-100 hover:text-foreground transition-opacity"
                              title="Copy Endpoint URL"
                            >
                              {isCopied ? (
                                <Check className="h-3 w-3 text-primary" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </button>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 text-muted-foreground">
                            <span className="font-semibold text-foreground">
                              {del.attempts}
                            </span>{" "}
                            {del.attempts === 1 ? "attempt" : "attempts"}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="text-foreground font-medium">
                              {formatDate(del.created_at)}
                            </span>
                            {relativeTime && (
                              <span className="text-[10px] text-muted-foreground">
                                {relativeTime}
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-right space-x-1 whitespace-nowrap">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setInspectingDelivery(del);
                            }}
                            className="h-8 gap-1.5 text-xs text-primary hover:text-primary hover:bg-secondary font-medium"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span>Inspect</span>
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleReplayClick(e, del)}
                            disabled={isReplaying || replayMutation.isPending}
                            className="h-8 gap-1 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary"
                            title="Re-dispatch delivery"
                          >
                            {isReplaying ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <RefreshCw className="h-3.5 w-3.5" />
                            )}
                            <span>Replay</span>
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Delivery Detail Modal */}
      <DeliveryDetailModal
        isOpen={Boolean(inspectingDelivery)}
        applicationId={applicationId}
        delivery={inspectingDelivery}
        onClose={() => setInspectingDelivery(null)}
      />
    </div>
  );
}
