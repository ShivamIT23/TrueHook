"use client";

import {
  Activity,
  Check,
  Code,
  Copy,
  Eye,
  Layers,
  Plus,
  Radio,
  RefreshCw,
  Search,
  Send,
  X,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Application } from "@/modules/applications/types";
import type { EventType } from "@/modules/event-types/types";
import { EventDetailModal } from "@/modules/events/components/EventDetailModal";
import { PublishEventModal } from "@/modules/events/components/PublishEventModal";
import { useEventsQuery } from "@/modules/events/hooks/useEvents";
import type { EventItem } from "@/modules/events/types";

interface EventsManagerProps {
  application: Application | null;
  initialEvents: EventItem[];
  totalEvents: number;
  eventTypes: EventType[];
}

export function EventsManager({
  application,
  initialEvents,
  totalEvents,
  eventTypes,
}: EventsManagerProps) {
  const applicationId = application?.id || "";

  const {
    data = { events: initialEvents, total: totalEvents },
    isFetching,
    refetch,
  } = useEventsQuery(applicationId, {
    events: initialEvents,
    total: totalEvents,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEventTypeFilter, setSelectedEventTypeFilter] = useState("");
  const [isPublishOpen, setIsPublishOpen] = useState(false);
  const [inspectingEvent, setInspectingEvent] = useState<EventItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const events = data.events || [];

  const handleCopyId = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  const filteredEvents = events.filter((evt) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      evt.id.toLowerCase().includes(q) ||
      evt.event_type_name.toLowerCase().includes(q) ||
      JSON.stringify(evt.payload).toLowerCase().includes(q);

    const matchesType =
      !selectedEventTypeFilter ||
      evt.event_type_name === selectedEventTypeFilter ||
      evt.event_type_id === selectedEventTypeFilter;

    return matchesSearch && matchesType;
  });

  // Calculate high-level metrics
  const totalDeliveriesDispatched = events.reduce(
    (acc, evt) => acc + (evt.deliveries_count || 0),
    0,
  );
  const uniqueTypesCount = new Set(
    events.map((e) => e.event_type_name || e.event_type_id),
  ).size;
  const avgFanout =
    events.length > 0
      ? (totalDeliveriesDispatched / events.length).toFixed(1)
      : "0.0";

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
            <Send className="h-4 w-4" />
            <span>Event Stream & Fanout</span>
          </div>
          <div className="mt-1 flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Events
            </h1>
            {application && (
              <span className="flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                <Layers className="h-3 w-3" />
                {application.name}
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Publish webhook events, inspect payloads, and track fanout
            deliveries across your registered endpoints.
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
            title="Refresh events"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${isFetching ? "animate-spin text-primary" : ""}`}
            />
            <span className="hidden sm:inline">Refresh</span>
          </Button>

          <Button
            size="sm"
            onClick={() => setIsPublishOpen(true)}
            disabled={!applicationId}
            className="h-9 gap-1.5 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            <span>Publish Event</span>
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
            Please create or select an active application to view and publish
            webhook events.
          </p>
        </div>
      )}

      {/* Metric Cards */}
      {application && (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-border bg-canvas p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Total Events
              </span>
              <Send className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">
              {events.length}
            </p>
            <span className="text-[11px] text-muted-foreground">
              Published event messages
            </span>
          </div>

          <div className="rounded-xl border border-border bg-canvas p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Dispatched Deliveries
              </span>
              <Layers className="h-4 w-4 text-primary" />
            </div>
            <p className="mt-2 text-2xl font-bold tracking-tight text-primary">
              {totalDeliveriesDispatched}
            </p>
            <span className="text-[11px] text-muted-foreground">
              Downstream destination targets
            </span>
          </div>

          <div className="rounded-xl border border-border bg-canvas p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Event Types
              </span>
              <Radio className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">
              {uniqueTypesCount}
            </p>
            <span className="text-[11px] text-muted-foreground">
              Distinct schemas observed
            </span>
          </div>

          <div className="rounded-xl border border-border bg-canvas p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Fanout Ratio
              </span>
              <Activity className="h-4 w-4 text-brass" />
            </div>
            <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">
              {avgFanout}
              <span className="text-sm font-normal text-muted-foreground ml-1">
                x
              </span>
            </p>
            <span className="text-[11px] text-muted-foreground">
              Avg deliveries per event
            </span>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by event ID, event type, or payload..."
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

          {eventTypes.length > 0 && (
            <select
              value={selectedEventTypeFilter}
              onChange={(e) => setSelectedEventTypeFilter(e.target.value)}
              aria-label="Filter events by type"
              className="rounded-xl border border-input bg-canvas px-3 py-2 text-xs text-foreground shadow-xs focus:border-primary focus:outline-hidden focus:ring-1 focus:ring-primary"
            >
              <option value="">All Event Types</option>
              {eventTypes.map((et) => (
                <option key={et.id} value={et.name}>
                  {et.name}
                </option>
              ))}
            </select>
          )}

          {(searchQuery || selectedEventTypeFilter) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setSelectedEventTypeFilter("");
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
            {filteredEvents.length}
          </span>{" "}
          of {events.length} {events.length === 1 ? "event" : "events"}
        </div>
      </div>

      {/* Events List / Table */}
      <div className="mt-4">
        {filteredEvents.length === 0 ? (
          <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-canvas p-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary/80 text-muted-foreground">
              <Send className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-foreground">
              {events.length === 0
                ? "No events published yet"
                : "No events match your filter"}
            </h3>
            <p className="mt-1 max-w-sm text-xs text-muted-foreground leading-relaxed">
              {events.length === 0
                ? "Publish your first webhook event to trigger deliveries across your registered endpoints."
                : "Try adjusting your search query or event type filter to find matching events."}
            </p>
            {events.length === 0 ? (
              <Button
                onClick={() => setIsPublishOpen(true)}
                disabled={!applicationId}
                className="mt-6 gap-2 bg-primary text-primary-foreground hover:bg-primary/90 text-xs"
              >
                <Plus className="h-4 w-4" />
                <span>Publish First Event</span>
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedEventTypeFilter("");
                }}
                className="mt-4 text-xs bg-canvas"
              >
                Reset Search Filters
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border bg-canvas shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-secondary/30 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    <th className="py-3 px-4">Event ID</th>
                    <th className="py-3 px-4">Event Type</th>
                    <th className="py-3 px-4">Payload Preview</th>
                    <th className="py-3 px-4">Fanout Deliveries</th>
                    <th className="py-3 px-4">Published</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-xs">
                  {filteredEvents.map((evt) => {
                    const isCopied = copiedId === evt.id;
                    const relativeTime = getRelativeTime(evt.created_at);

                    return (
                      <tr
                        key={evt.id}
                        className="hover:bg-secondary/25 transition-colors cursor-pointer group"
                        onClick={() => setInspectingEvent(evt)}
                      >
                        <td className="py-3.5 px-4 font-mono text-foreground font-medium whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span className="text-foreground">
                              {evt.id.length > 18
                                ? `${evt.id.slice(0, 10)}...${evt.id.slice(-6)}`
                                : evt.id}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => handleCopyId(e, evt.id)}
                              className="rounded p-1 text-muted-foreground opacity-60 group-hover:opacity-100 hover:text-foreground transition-opacity"
                              title="Copy Event ID"
                            >
                              {isCopied ? (
                                <Check className="h-3 w-3 text-primary" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </button>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                            {evt.event_type_name || "event"}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 max-w-xs sm:max-w-md">
                          <div className="rounded-md bg-secondary/50 border border-border/60 px-2.5 py-1 font-mono text-[11px] text-muted-foreground truncate select-all">
                            {JSON.stringify(evt.payload)}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/40 px-2.5 py-0.5 text-xs font-medium text-foreground">
                            <Layers className="h-3 w-3 text-primary" />
                            <span>
                              {evt.deliveries_count ?? 0}{" "}
                              {evt.deliveries_count === 1
                                ? "delivery"
                                : "deliveries"}
                            </span>
                          </span>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="text-foreground font-medium">
                              {formatDate(evt.created_at)}
                            </span>
                            {relativeTime && (
                              <span className="text-[10px] text-muted-foreground">
                                {relativeTime}
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setInspectingEvent(evt);
                            }}
                            className="h-8 gap-1.5 text-xs text-primary hover:text-primary hover:bg-secondary font-medium"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span>Inspect</span>
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

      {/* Publish Event Modal */}
      <PublishEventModal
        isOpen={isPublishOpen}
        applicationId={applicationId}
        eventTypes={eventTypes}
        onClose={() => setIsPublishOpen(false)}
      />

      {/* Event Details Inspection Modal */}
      <EventDetailModal
        isOpen={Boolean(inspectingEvent)}
        applicationId={applicationId}
        event={inspectingEvent}
        onClose={() => setInspectingEvent(null)}
      />
    </div>
  );
}
