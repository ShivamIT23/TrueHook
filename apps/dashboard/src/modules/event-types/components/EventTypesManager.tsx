"use client";

import {
  Check,
  Copy,
  Layers,
  Pencil,
  Plus,
  Radio,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Application } from "@/modules/applications/types";
import { CreateEventTypeModal } from "@/modules/event-types/components/CreateEventTypeModal";
import { DeleteEventTypeDialog } from "@/modules/event-types/components/DeleteEventTypeDialog";
import { EditEventTypeModal } from "@/modules/event-types/components/EditEventTypeModal";
import { useEventTypesQuery } from "@/modules/event-types/hooks/useEventTypes";
import type { EventType } from "@/modules/event-types/types";

interface EventTypesManagerProps {
  application: Application | null;
  initialEventTypes: EventType[];
}

export function EventTypesManager({
  application,
  initialEventTypes,
}: EventTypesManagerProps) {
  const applicationId = application?.id || "";

  // TanStack Query for caching, automatic revalidation, and background updates
  const {
    data: eventTypes = [],
    isLoading,
    isFetching,
    refetch,
  } = useEventTypesQuery(applicationId, initialEventTypes);

  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingEventType, setEditingEventType] = useState<EventType | null>(
    null,
  );
  const [deletingEventType, setDeletingEventType] = useState<EventType | null>(
    null,
  );
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyName = (name: string, id: string) => {
    navigator.clipboard.writeText(name);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  const filteredEventTypes = eventTypes.filter((et) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      et.name.toLowerCase().includes(q) ||
      et.description.toLowerCase().includes(q)
    );
  });

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      if (Number.isNaN(date.getTime())) return "Recently";
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(date);
    } catch {
      return "Recently";
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
            <Radio className="h-4 w-4" />
            <span>Schema & Registry</span>
          </div>
          <div className="mt-1 flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Event Types
            </h1>
            {application && (
              <span className="flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                <Layers className="h-3 w-3" />
                {application.name}
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Define and manage structured event identifiers published by your
            application.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching || !applicationId}
            className="h-9 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            title="Refresh endpoints"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${isFetching ? "animate-spin text-primary" : ""}`}
            />
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            disabled={!applicationId}
            className="h-9 gap-1.5 text-xs"
          >
            <Plus className="h-4 w-4" />
            <span>Create Event Type</span>
          </Button>
        </div>
      </div>

      {/* Control Bar: Search & Counts */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by event name or description..."
            className="h-9 pl-8 pr-8 text-xs border-border bg-canvas focus:border-primary focus:ring-ring"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">
            {filteredEventTypes.length}
          </span>
          <span>
            {filteredEventTypes.length === 1 ? "event type" : "event types"}
          </span>
          {searchQuery && (
            <span className="text-[11px] text-muted-foreground">
              (filtered from {eventTypes.length})
            </span>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="mt-4">
        {isLoading && eventTypes.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-canvas p-12 text-center">
            <RefreshCw className="h-6 w-6 animate-spin text-primary" />
            <p className="mt-3 text-xs text-muted-foreground">
              Loading event types...
            </p>
          </div>
        ) : eventTypes.length === 0 ? (
          /* Empty State: No event types created yet */
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-canvas p-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Radio className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-foreground">
              No Event Types Configured
            </h3>
            <p className="mt-1.5 max-w-md text-xs leading-relaxed text-muted-foreground">
              Event types define what notifications your application can emit
              (e.g.{" "}
              <code className="rounded bg-secondary px-1 py-0.5 font-mono text-primary">
                order.created
              </code>
              ,{" "}
              <code className="rounded bg-secondary px-1 py-0.5 font-mono text-primary">
                invoice.paid
              </code>
              ). Registered webhook endpoints can subscribe to specific event
              types.
            </p>
            <Button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="mt-6 h-9 cursor-pointer border border-primary bg-primary px-4 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              <span>Create Event Type</span>
            </Button>
          </div>
        ) : filteredEventTypes.length === 0 ? (
          /* Search Empty State */
          <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-canvas p-12 text-center">
            <Search className="h-8 w-8 text-muted-foreground" />
            <h3 className="mt-3 text-sm font-semibold text-foreground">
              No matching event types
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              No event types matched your query &ldquo;{searchQuery}&rdquo;.
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={() => setSearchQuery("")}
              className="mt-4 h-8 px-3 text-xs border-border text-foreground hover:bg-secondary"
            >
              Clear filter
            </Button>
          </div>
        ) : (
          /* Event Types Table / Cards */
          <div className="overflow-hidden rounded-xl border border-border bg-canvas shadow-xs">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-border bg-secondary/50 text-muted-foreground">
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider text-[11px]">
                    Identifier
                  </th>
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider text-[11px]">
                    Description
                  </th>
                  <th className="hidden py-3 px-4 font-semibold uppercase tracking-wider text-[11px] sm:table-cell">
                    Created
                  </th>
                  <th className="py-3 px-4 text-right font-semibold uppercase tracking-wider text-[11px]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredEventTypes.map((et) => {
                  const isCopied = copiedId === et.id;
                  return (
                    <tr
                      key={et.id}
                      className="group transition-colors hover:bg-secondary/40"
                    >
                      <td className="py-3.5 px-4 font-medium">
                        <div className="flex items-center gap-2">
                          <span className="rounded-md border border-border bg-secondary px-2 py-0.5 font-mono text-xs font-semibold text-primary">
                            {et.name}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyName(et.name, et.id)}
                            className="rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-border hover:text-foreground group-hover:opacity-100 cursor-pointer"
                            title="Copy event name"
                            aria-label={`Copy event name ${et.name}`}
                          >
                            {isCopied ? (
                              <Check className="h-3.5 w-3.5 text-primary" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-muted-foreground max-w-md">
                        <p className="line-clamp-2 text-xs leading-relaxed text-foreground">
                          {et.description}
                        </p>
                      </td>

                      <td className="hidden py-3.5 px-4 text-muted-foreground sm:table-cell whitespace-nowrap">
                        {formatDate(et.created_at)}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setEditingEventType(et)}
                            className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-primary transition-colors cursor-pointer"
                            title="Edit event type"
                            aria-label={`Edit ${et.name}`}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingEventType(et)}
                            className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors cursor-pointer"
                            title="Delete event type"
                            aria-label={`Delete ${et.name}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateEventTypeModal
        isOpen={isCreateOpen}
        applicationId={applicationId}
        onClose={() => setIsCreateOpen(false)}
      />

      <EditEventTypeModal
        isOpen={Boolean(editingEventType)}
        applicationId={applicationId}
        eventType={editingEventType}
        onClose={() => setEditingEventType(null)}
      />

      <DeleteEventTypeDialog
        isOpen={Boolean(deletingEventType)}
        applicationId={applicationId}
        eventType={deletingEventType}
        onClose={() => setDeletingEventType(null)}
      />
    </div>
  );
}
