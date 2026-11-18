"use client";

import {
  Calendar,
  Check,
  Copy,
  Layers,
  Plus,
  Search,
  Shield,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { selectApplicationAction } from "@/actions/applications";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import type { Application } from "@/modules/applications/types";
import { CreateApplicationModal } from "./CreateApplicationModal";
import { DeleteApplicationDialog } from "./DeleteApplicationDialog";

export interface ApplicationsManagerProps {
  initialApplications: Application[];
  activeApplication: Application | null;
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return "Recently";
  try {
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export function ApplicationsManager({
  initialApplications,
  activeApplication,
}: ApplicationsManagerProps) {
  const [applications, setApplications] =
    useState<Application[]>(initialApplications);
  const [currentApp, setCurrentApp] = useState<Application | null>(
    activeApplication,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [deletingApp, setDeletingApp] = useState<Application | null>(null);
  const [isSwitchingId, setIsSwitchingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const router = useRouter();

  const filteredApps = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return applications;
    return applications.filter(
      (app) =>
        app.name.toLowerCase().includes(q) ||
        app.description?.toLowerCase().includes(q),
    );
  }, [applications, searchQuery]);

  const handleCopyId = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    toast({
      message: "Application ID copied to clipboard",
      state: "success",
    });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSelectApp = async (app: Application) => {
    if (app.id === currentApp?.id || isSwitchingId) return;

    try {
      setIsSwitchingId(app.id);
      if (typeof window !== "undefined") {
        localStorage.setItem("truehook_selected_app", JSON.stringify(app));
        localStorage.setItem("truehook_selected_app_id", app.id);
      }
      await selectApplicationAction(app);
      setCurrentApp(app);
      toast({
        message: `Switched active workspace to "${app.name}"`,
        state: "success",
      });
      router.refresh();
    } catch (_err) {
      toast({
        message: "Failed to switch application.",
        state: "error",
      });
    } finally {
      setIsSwitchingId(null);
    }
  };

  const handleAppCreated = (newApp: Application) => {
    setApplications((prev) => [newApp, ...prev]);
  };

  const handleAppDeleted = (deletedId: string) => {
    setApplications((prev) => prev.filter((a) => a.id !== deletedId));
    if (currentApp?.id === deletedId) {
      const remaining = applications.filter((a) => a.id !== deletedId);
      if (remaining.length > 0) {
        handleSelectApp(remaining[0]);
      } else {
        router.push("/");
      }
    }
  };

  return (
    <div className="relative isolate min-h-[calc(100vh-5rem)] overflow-y-auto">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 pb-32">
        {/* Page Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
              <Layers className="h-4 w-4" />
              <span>Workspace Management</span>
            </div>
            <div className="mt-1 flex items-center gap-2.5">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                Applications
              </h1>
              <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                {applications.length}{" "}
                {applications.length === 1 ? "app" : "apps"}
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage your webhook applications, switch between active
              workspaces, or register new event sources.
            </p>
          </div>

          <Button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="h-9 px-4 text-xs bg-primary text-primary-foreground hover:bg-primary/90 transition-all cursor-pointer shadow-xs"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            <span>Create Application</span>
          </Button>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-8">
          <Card className="rounded-xl border border-border bg-canvas p-5 shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between p-0">
              <span className="text-xs font-medium text-muted-foreground">
                Total Applications
              </span>
              <Layers className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="mt-3 p-0">
              <div className="text-2xl font-bold text-foreground">
                {applications.length}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Configured event sources
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-xl border border-border bg-canvas p-5 shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between p-0">
              <span className="text-xs font-medium text-muted-foreground">
                Active Workspace
              </span>
              <span className="flex h-2 w-2 rounded-full bg-primary" />
            </CardHeader>
            <CardContent className="mt-3 p-0">
              <div className="text-lg font-bold text-foreground truncate">
                {currentApp?.name || "None Selected"}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Currently scoped for events & deliveries
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-xl border border-border bg-canvas p-5 shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between p-0">
              <span className="text-xs font-medium text-muted-foreground">
                Security Standard
              </span>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="mt-3 p-0">
              <div className="text-lg font-bold text-foreground">
                HMAC-SHA256
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Isolated per-endpoint secret keys
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search & Filter Bar */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search applications by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs bg-canvas border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-ring"
            />
          </div>
          <div className="text-xs text-muted-foreground">
            Showing {filteredApps.length} of {applications.length} applications
          </div>
        </div>

        {/* Applications Grid */}
        {filteredApps.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-canvas p-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-secondary2">
              <Layers className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-sm font-semibold text-foreground">
              {searchQuery ? "No matching applications" : "No applications yet"}
            </h3>
            <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
              {searchQuery
                ? `No application names or descriptions matched "${searchQuery}". Clear your search query to see all applications.`
                : "Create your first application to start registering webhook endpoints and publishing events."}
            </p>
            {!searchQuery && (
              <Button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className="mt-4 h-8 px-3 text-xs bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                <span>Create Application</span>
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredApps.map((app) => {
              const isActive = app.id === currentApp?.id;
              const isSwitching = isSwitchingId === app.id;

              return (
                <div
                  key={app.id}
                  className={`relative flex flex-col justify-between rounded-xl border p-5 transition-all bg-canvas shadow-xs ${
                    isActive
                      ? "border-primary ring-1 ring-primary"
                      : "border-border hover:border-border/80"
                  }`}
                >
                  <div>
                    {/* Top row: Name + Badge */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary2 border border-border text-foreground font-semibold text-xs">
                          {app.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-sm font-semibold text-foreground truncate">
                            {app.name}
                          </h3>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="font-mono text-[10px] text-muted-foreground truncate max-w-28">
                              {app.id}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => handleCopyId(app.id, e)}
                              className="text-muted-foreground hover:text-foreground transition-colors p-0.5"
                              title="Copy Application ID"
                            >
                              {copiedId === app.id ? (
                                <Check className="h-3 w-3 text-primary" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>

                      {isActive && (
                        <span className="shrink-0 flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                          <Check className="h-2.5 w-2.5" />
                          <span>Active</span>
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    <p className="mt-3 text-xs text-muted-foreground line-clamp-2 min-h-8">
                      {app.description ||
                        "No description provided for this application."}
                    </p>

                    {/* Meta info */}
                    <div className="mt-4 flex items-center gap-2 text-[11px] text-muted-foreground border-t border-border/50 pt-3">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>Created {formatDate(app.created_at)}</span>
                    </div>
                  </div>

                  {/* Actions footer */}
                  <div className="mt-4 flex items-center justify-between gap-2 pt-3 border-t border-border/50">
                    {isActive ? (
                      <span className="text-xs font-medium text-primary flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                        Selected Workspace
                      </span>
                    ) : (
                      <Button
                        type="button"
                        variant="secondary"
                        disabled={isSwitching}
                        onClick={() => handleSelectApp(app)}
                        className="h-8 px-3 text-xs border-border hover:bg-secondary2 cursor-pointer"
                      >
                        {isSwitching ? "Switching..." : "Switch to App"}
                      </Button>
                    )}

                    <button
                      type="button"
                      onClick={() => setDeletingApp(app)}
                      className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors cursor-pointer"
                      title="Delete Application"
                      aria-label={`Delete ${app.name}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Creation Modal */}
      <CreateApplicationModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleAppCreated}
      />

      {/* Deletion Dialog */}
      <DeleteApplicationDialog
        isOpen={Boolean(deletingApp)}
        application={deletingApp}
        onClose={() => setDeletingApp(null)}
        onSuccess={handleAppDeleted}
      />
    </div>
  );
}
