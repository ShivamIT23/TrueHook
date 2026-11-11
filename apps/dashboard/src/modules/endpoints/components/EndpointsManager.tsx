"use client";

import {
  Check,
  Copy,
  Eye,
  EyeOff,
  Globe,
  Key,
  Layers,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Webhook,
  X,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Application } from "@/modules/applications/types";
import { CreateEndpointModal } from "@/modules/endpoints/components/CreateEndpointModal";
import { DeleteEndpointDialog } from "@/modules/endpoints/components/DeleteEndpointDialog";
import { EditEndpointModal } from "@/modules/endpoints/components/EditEndpointModal";
import { useEndpointsQuery } from "@/modules/endpoints/hooks/useEndpoints";
import type { Endpoint } from "@/modules/endpoints/types";

interface EndpointsManagerProps {
  application: Application | null;
  initialEndpoints: Endpoint[];
}

export function EndpointsManager({
  application,
  initialEndpoints,
}: EndpointsManagerProps) {
  const applicationId = application?.id || "";

  // React Query for caching, background revalidation, and instant optimistic updates
  const {
    data: endpoints = [],
    isLoading,
    isFetching,
    refetch,
  } = useEndpointsQuery(applicationId, initialEndpoints);

  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingEndpoint, setEditingEndpoint] = useState<Endpoint | null>(null);
  const [deletingEndpoint, setDeletingEndpoint] = useState<Endpoint | null>(
    null,
  );
  const [copiedUrlId, setCopiedUrlId] = useState<string | null>(null);
  const [copiedSecretId, setCopiedSecretId] = useState<string | null>(null);
  const [revealedSecrets, setRevealedSecrets] = useState<
    Record<string, boolean>
  >({});

  const handleCopyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrlId(id);
    setTimeout(() => {
      setCopiedUrlId(null);
    }, 2000);
  };

  const handleCopySecret = (secret: string, id: string) => {
    navigator.clipboard.writeText(secret);
    setCopiedSecretId(id);
    setTimeout(() => {
      setCopiedSecretId(null);
    }, 2000);
  };

  const toggleRevealSecret = (id: string) => {
    setRevealedSecrets((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const filteredEndpoints = endpoints.filter((ep) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return ep.url.toLowerCase().includes(q);
  });

  const activeCount = endpoints.filter((ep) => ep.enabled).length;
  const disabledCount = endpoints.length - activeCount;

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

  const maskSecret = (secret?: string) => {
    if (!secret) return "whsec_••••••••••••";
    if (secret.length <= 10) return "••••••••••••";
    return `${secret.slice(0, 6)}••••••••••••${secret.slice(-4)}`;
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
            <Webhook className="h-4 w-4" />
            <span>Delivery Destinations</span>
          </div>
          <div className="mt-1 flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Webhook Endpoints
            </h1>
            {application && (
              <span className="flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                <Layers className="h-3 w-3" />
                {application.name}
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Configure destination URLs and signing secrets for automated HTTP
            webhook dispatches.
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2.5">
          <Button
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
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            disabled={!applicationId}
            className="h-9 gap-1.5 text-xs"
          >
            <Plus className="h-4 w-4" />
            <span>Register Endpoint</span>
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
            Please create or select an active application from the switcher
            above to view and register webhook endpoints.
          </p>
        </div>
      )}

      {/* Overview Metric Badges */}
      {application && (
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-canvas p-4 shadow-xs">
            <p className="text-xs font-medium text-muted-foreground">
              Total Endpoints
            </p>
            <p className="mt-1 text-2xl font-bold text-foreground">
              {endpoints.length}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-canvas p-4 shadow-xs">
            <p className="text-xs font-medium text-muted-foreground">
              Active Delivery
            </p>
            <p className="mt-1 text-2xl font-bold text-primary">
              {activeCount}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-canvas p-4 shadow-xs">
            <p className="text-xs font-medium text-muted-foreground">
              Paused / Inactive
            </p>
            <p className="mt-1 text-2xl font-bold text-muted-foreground">
              {disabledCount}
            </p>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      {application && (
        <div className="mt-6 rounded-2xl border border-border bg-canvas shadow-xs">
          {/* Search & Filter Toolbar */}
          <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search endpoints by URL..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 text-xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <span className="text-xs text-muted-foreground">
              Showing{" "}
              <span className="font-semibold text-foreground">
                {filteredEndpoints.length}
              </span>{" "}
              of {endpoints.length} registered
            </span>
          </div>

          {/* Table / List View */}
          {isLoading && endpoints.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <RefreshCw className="h-6 w-6 animate-spin text-primary" />
              <p className="mt-3 text-xs text-muted-foreground">
                Loading webhook endpoints...
              </p>
            </div>
          ) : filteredEndpoints.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-muted-foreground">
                <Globe className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-sm font-semibold text-foreground">
                {searchQuery
                  ? "No matching endpoints"
                  : "No endpoints registered yet"}
              </h3>
              <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                {searchQuery
                  ? "No webhook endpoints matched your search filter. Try clearing the search query."
                  : "Register a destination URL to begin receiving automated webhook payloads for events dispatched by this application."}
              </p>
              <div className="mt-5">
                {searchQuery ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSearchQuery("")}
                    className="text-xs"
                  >
                    Clear Filter
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => setIsCreateOpen(true)}
                    className="text-xs gap-1.5"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Register First Endpoint
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border bg-secondary/40 text-muted-foreground">
                    <th className="py-3 px-4 font-semibold">Destination URL</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                    <th className="py-3 px-4 font-semibold">Signing Secret</th>
                    <th className="py-3 px-4 font-semibold">Created</th>
                    <th className="py-3 px-4 font-semibold text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredEndpoints.map((ep) => {
                    const isHttps = ep.url.startsWith("https://");
                    const isSecretRevealed = Boolean(revealedSecrets[ep.id]);

                    return (
                      <tr
                        key={ep.id}
                        className="hover:bg-secondary/30 transition-colors"
                      >
                        {/* Destination URL */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span
                              className={`rounded px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider ${
                                isHttps
                                  ? "bg-primary/10 text-primary border border-primary/20"
                                  : "bg-brass/10 text-brass border border-brass/20"
                              }`}
                            >
                              {isHttps ? "HTTPS" : "HTTP"}
                            </span>
                            <span className="font-mono text-xs font-semibold text-foreground max-w-md truncate">
                              {ep.url}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopyUrl(ep.url, ep.id)}
                              className="rounded p-1 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                              title="Copy URL"
                            >
                              {copiedUrlId === ep.id ? (
                                <Check className="h-3 w-3 text-primary" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </button>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          {ep.enabled ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary border border-primary/20">
                              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground border border-border">
                              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                              Disabled
                            </span>
                          )}
                        </td>

                        {/* Signing Secret */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <Key className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <span className="font-mono text-[11px] text-muted-foreground max-w-[160px] truncate">
                              {isSecretRevealed
                                ? ep.secret_encrypted || "whsec_..."
                                : maskSecret(ep.secret_encrypted)}
                            </span>
                            {ep.secret_encrypted && (
                              <button
                                type="button"
                                onClick={() => toggleRevealSecret(ep.id)}
                                className="rounded p-1 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                                title={
                                  isSecretRevealed
                                    ? "Hide Secret"
                                    : "Reveal Secret"
                                }
                              >
                                {isSecretRevealed ? (
                                  <EyeOff className="h-3 w-3" />
                                ) : (
                                  <Eye className="h-3 w-3" />
                                )}
                              </button>
                            )}
                            {ep.secret_encrypted && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleCopySecret(
                                    ep.secret_encrypted || "",
                                    ep.id,
                                  )
                                }
                                className="rounded p-1 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                                title="Copy Secret"
                              >
                                {copiedSecretId === ep.id ? (
                                  <Check className="h-3 w-3 text-primary" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </button>
                            )}
                          </div>
                        </td>

                        {/* Created Date */}
                        <td className="py-3.5 px-4 text-muted-foreground whitespace-nowrap">
                          {formatDate(ep.created_at)}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingEndpoint(ep)}
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-secondary"
                              title="Edit Endpoint"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeletingEndpoint(ep)}
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                              title="Delete Endpoint"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              <span className="sr-only">Delete</span>
                            </Button>
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
      )}

      {/* Modals */}
      <CreateEndpointModal
        isOpen={isCreateOpen}
        applicationId={applicationId}
        onClose={() => setIsCreateOpen(false)}
      />

      <EditEndpointModal
        isOpen={Boolean(editingEndpoint)}
        endpoint={editingEndpoint}
        applicationId={applicationId}
        onClose={() => setEditingEndpoint(null)}
      />

      <DeleteEndpointDialog
        isOpen={Boolean(deletingEndpoint)}
        endpoint={deletingEndpoint}
        applicationId={applicationId}
        onClose={() => setDeletingEndpoint(null)}
      />
    </div>
  );
}
