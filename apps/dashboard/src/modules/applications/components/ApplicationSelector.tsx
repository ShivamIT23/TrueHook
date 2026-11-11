"use client";

import {
  Calendar,
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  ExternalLink,
  Layers,
  Loader2,
  Plus,
  Trash,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { selectApplicationAction } from "@/actions/applications";
import { Button } from "@/components/ui/button";
import type { Application } from "@/modules/applications/types";
import { CreateApplicationModal } from "./CreateApplicationModal";

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function formatCreatedDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return dateStr;
    return `${MONTH_NAMES[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
  } catch {
    return dateStr;
  }
}

interface ApplicationSelectorProps {
  initialApplications: Application[];
}

export function ApplicationSelector({
  initialApplications,
}: ApplicationSelectorProps) {
  const [applications, setApplications] =
    useState<Application[]>(initialApplications);
  const [selectedAppId, setSelectedAppId] = useState<string | null>(
    initialApplications.length > 0 ? initialApplications[0].id : null,
  );
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isEntering, setIsEntering] = useState(false);
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedApp =
    applications.find((app) => app.id === selectedAppId) || null;

  // On mount, if an application was previously saved to localhost (localStorage), restore selection
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const savedId = localStorage.getItem("truehook_selected_app_id");
      if (savedId && applications.some((app) => app.id === savedId)) {
        setSelectedAppId(savedId);
      }
    } catch {
      // LocalStorage access not available
    }
  }, [applications]);

  // Handle clicking outside the selector to close the dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }

    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [dropdownOpen]);

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAppCreated = (newApp: Application) => {
    setApplications((prev) => {
      const filtered = prev.filter((a) => a.id !== newApp.id);
      return [newApp, ...filtered];
    });
    setSelectedAppId(newApp.id);
    setDropdownOpen(false);
  };

  const handleEnterApplication = async () => {
    if (!selectedApp || isEntering) return;
    setIsEntering(true);

    try {
      // 1. Save application data to localhost (localStorage)
      if (typeof window !== "undefined") {
        localStorage.setItem(
          "truehook_selected_app",
          JSON.stringify(selectedApp),
        );
        localStorage.setItem("truehook_selected_app_id", selectedApp.id);
      }

      // 2. Persist in cookies via Server Action so Next.js server components
      // and middleware can protect the dashboard and redirect / to /dashboard
      await selectApplicationAction(selectedApp);

      // 3. Send the user to the dashboard page
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      console.error("Failed to enter application:", err);
      setIsEntering(false);
    }
  };

  return (
    <div className="flex w-full flex-col items-center justify-center py-12 px-4 h-full">
      {/* Centered Application Card */}
      <div
        ref={containerRef}
        className="w-full max-w-2xl rounded-2xl border border-border bg-canvas p-6 shadow-xs sm:p-8 transition-all"
      >
        {/* Header Row: Title + Description on left, + Create Application on right */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Select an Application
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Choose an application to continue, or create a new one.
            </p>
          </div>

          <Button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="h-10 cursor-pointer rounded-lg border border-foreground bg-foreground px-4 text-sm font-medium text-canvas transition-colors hover:bg-foreground/90 self-start sm:self-auto shrink-0 shadow-xs"
          >
            <Plus className="h-4 w-4" />
            <span>Create Application</span>
          </Button>
        </div>

        {/* Select Trigger Box */}
        <div className="mt-6 w-full">
          <button
            type="button"
            onClick={() => {
              if (applications.length === 0) {
                setIsModalOpen(true);
              } else {
                setDropdownOpen(!dropdownOpen);
              }
            }}
            className={`flex h-11 w-full items-center justify-between rounded-xl px-4 text-left text-sm transition-colors focus-visible:outline-none cursor-pointer ${
              dropdownOpen
                ? "border-2 border-primary bg-canvas ring-0"
                : "border border-border bg-canvas hover:border-foreground"
            }`}
            aria-expanded={dropdownOpen}
            aria-label="Select an application"
          >
            <div className="flex items-center gap-2.5 truncate">
              {selectedApp ? (
                <>
                  <Layers className="h-4 w-4 text-foreground shrink-0" />
                  <span className="font-semibold text-sm text-foreground truncate">
                    {selectedApp.name}
                  </span>
                </>
              ) : (
                <span className="text-sm text-muted-foreground">
                  Select an application...
                </span>
              )}
            </div>
            {dropdownOpen ? (
              <ChevronUp className="h-4 w-4 text-foreground shrink-0" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
            )}
          </button>

          {/* In-flow Dropdown List (expands parent card cleanly without clipping) */}
          {dropdownOpen && (
            <div className="mt-2.5 w-full max-h-72 overflow-y-auto rounded-2xl border border-border bg-canvas p-2 shadow-xs scrollbar-thin [scrollbar-color:var(--border)_transparent]">
              {applications.length > 0 ? (
                <div className="flex flex-col gap-1">
                  {applications.map((app) => {
                    const isSelected = Boolean(
                      app.id && app.id === selectedAppId,
                    );
                    return (
                      <button
                        key={app.id}
                        type="button"
                        onClick={() => {
                          setSelectedAppId(app.id);
                          setDropdownOpen(false);
                        }}
                        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors cursor-pointer ${
                          isSelected ? "bg-secondary" : "hover:bg-secondary/60"
                        }`}
                      >
                        {/* Square Badge with First Letter */}
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-xs font-bold text-muted-foreground shrink-0 select-none">
                          {app.name[0]?.toUpperCase()}
                        </div>

                        {/* Name & ID / Description */}
                        <div className="flex min-w-0 flex-1 flex-col text-left">
                          <span className="truncate text-sm font-semibold text-foreground leading-tight">
                            {app.name}
                          </span>
                          <span className="truncate text-xs text-muted-foreground leading-tight mt-0.5">
                            {app.description || app.id}
                          </span>
                        </div>

                        {/* Checkmark Icon */}
                        {isSelected && (
                          <Check className="h-4 w-4 text-primary shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 text-center">
                  <p className="text-xs text-muted-foreground">
                    No applications registered yet.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setDropdownOpen(false);
                      setIsModalOpen(true);
                    }}
                    className="mt-2 text-xs font-semibold text-primary hover:underline cursor-pointer"
                  >
                    + Create your first application
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Showcase the selected application's complete data (visible when dropdown is closed) */}
        {!dropdownOpen && selectedApp && (
          <div className="mt-6 rounded-xl border border-border bg-secondary/40 p-5 animate-in fade-in">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 relative">
                {selectedApp.logo_url ? (
                  // biome-ignore lint/performance/noImgElement: dynamic application logo URL
                  <img
                    src={selectedApp.logo_url}
                    alt={selectedApp.name}
                    className="h-10 w-10 rounded-[5px] border border-border object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-[5px] bg-primary text-sm font-bold text-primary-foreground shadow-xs">
                    {selectedApp.name[0]?.toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-semibold text-foreground">
                      {selectedApp.name}
                    </h2>
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                      Active
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {selectedApp.description}
                  </p>
                </div>
                <Trash size={15} className="text-destructive cursor-pointer" />
              </div>
            </div>

            {/* Data Attributes Grid */}
            <div className="mt-5 grid grid-cols-1 gap-3 border-t border-border pt-4 sm:grid-cols-2">
              <div className="space-y-1">
                <span className="text-[11px] font-medium text-muted-foreground ml-0.5">
                  Application ID
                </span>
                <div className="flex items-center gap-1.5">
                  <code className="rounded bg-canvas px-2 py-1 font-mono text-xs text-foreground border border-border truncate">
                    {selectedApp.id}
                  </code>
                  <button
                    type="button"
                    onClick={() => handleCopyId(selectedApp.id)}
                    className="rounded-md border border-border bg-canvas p-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    title="Copy Application ID"
                    aria-label="Copy Application ID"
                  >
                    {copied ? (
                      <Check className="h-3.5 w-3.5 text-primary" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-1 mx-auto">
                <span className="text-[11px] font-medium text-muted-foreground ml-0.5">
                  Created At
                </span>
                <div className="flex items-center gap-1.5 text-xs text-foreground py-1 font-bold">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  <span suppressHydrationWarning>
                    {formatCreatedDate(selectedApp.created_at)}
                  </span>
                </div>
              </div>
            </div>

            {/* Application Quick Actions */}
            <div className="mt-5 flex flex-wrap justify-between items-center gap-2.5 border-t border-border pt-4">
              <Button
                type="button"
                onClick={handleEnterApplication}
                disabled={isEntering}
                variant="outline"
                className="h-fit py-1.5 px-3 cursor-pointer border-border bg-canvas text-sm font-medium text-foreground hover:bg-secondary transition-colors disabled:opacity-50"
              >
                {isEntering ? (
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                ) : (
                  <ExternalLink className="h-4 w-4 text-primary" />
                )}
                <span className="font-medium text-sm">
                  Enter{" "}
                  <span className="font-extrabold text-sm text-primary">
                    {selectedApp.name}
                  </span>
                </span>
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Dialog (only mounted when open so form state is always fresh) */}
      {isModalOpen && (
        <CreateApplicationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleAppCreated}
        />
      )}
    </div>
  );
}
