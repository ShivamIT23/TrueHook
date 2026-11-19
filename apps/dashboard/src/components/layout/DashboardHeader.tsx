"use client";

import {
  Bell,
  Check,
  ChevronDown,
  HelpCircle,
  Layers,
  LogOut,
  Menu,
  Settings2,
  ShieldCheck,
  User,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  getApplicationsAction,
  selectApplicationAction,
} from "@/actions/applications";
import { logoutAction } from "@/actions/auth";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import type { AuthUser } from "@/lib/types";
import type { Application } from "@/modules/applications/types";
import { TrueHookLogo } from "@/modules/auth/TrueHookLogo";

interface DashboardHeaderProps {
  user: AuthUser | null;
  application?: Application | null;
  applications?: Application[];
  onToggleMobileSidebar?: () => void;
  showLogo?: boolean;
}

export function DashboardHeader({
  user,
  application,
  applications,
  onToggleMobileSidebar,
  showLogo = true,
}: DashboardHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [appSelectOpen, setAppSelectOpen] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const [appList, setAppList] = useState<Application[]>(applications || []);
  const appSelectRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (applications && applications.length > 0) {
      setAppList(applications);
    } else {
      getApplicationsAction().then((apps) => {
        if (apps && apps.length > 0) setAppList(apps);
      });
    }
  }, [applications]);

  // Close app select dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        appSelectRef.current &&
        !appSelectRef.current.contains(e.target as Node)
      ) {
        setAppSelectOpen(false);
      }
    }
    if (appSelectOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [appSelectOpen]);

  const handleSelectApp = async (app: Application) => {
    if (app.id === application?.id || isSwitching) {
      setAppSelectOpen(false);
      return;
    }

    try {
      setIsSwitching(true);
      if (typeof window !== "undefined") {
        localStorage.setItem("truehook_selected_app", JSON.stringify(app));
        localStorage.setItem("truehook_selected_app_id", app.id);
      }
      await selectApplicationAction(app);
      setAppSelectOpen(false);
      router.refresh();
    } catch (err) {
      console.error("Failed to switch application:", err);
    } finally {
      setIsSwitching(false);
    }
  };

  const displayName = user?.name || user?.email?.split("@")[0] || "User";
  const displayEmail = user?.email || "";
  const firstLetter = (user?.name || user?.email || "U")[0].toUpperCase();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full items-center justify-between px-4 sm:px-6 lg:px-8 py-2">
        {/* Top-Left: Mobile Menu Toggle, TrueHook Logo & Active Application */}
        <div className="flex items-center gap-2 sm:gap-3">
          {onToggleMobileSidebar && (
            <button
              type="button"
              onClick={onToggleMobileSidebar}
              className="flex items-center justify-center p-1.5 rounded-lg text-foreground hover:bg-secondary2 md:hidden cursor-pointer"
              aria-label="Open sidebar"
            >
              <Menu size={20} />
            </button>
          )}

          {showLogo && <TrueHookLogo theme="light" />}
          {!showLogo && (
            <div className="md:hidden">
              <TrueHookLogo theme="light" />
            </div>
          )}

          {application && (
            <div className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-border">
              {/* Application Select Pill */}
              <div ref={appSelectRef} className="relative">
                <button
                  type="button"
                  onClick={() => setAppSelectOpen((prev) => !prev)}
                  className="flex items-center gap-1.5 rounded-xl bg-canvas hover:bg-secondary2 px-2.5 py-1 border border-border shadow-2xs transition-colors cursor-pointer text-left"
                  aria-haspopup="listbox"
                  aria-expanded={appSelectOpen}
                  aria-label="Change application"
                >
                  <Layers className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="text-xs font-semibold text-foreground max-w-28 sm:max-w-40 truncate">
                    {application.name}
                  </span>
                  <ChevronDown
                    className={`h-3 w-3 text-muted-foreground transition-transform duration-200 ${
                      appSelectOpen ? "rotate-180 text-foreground" : ""
                    }`}
                  />
                </button>

                {/* Application Dropdown Menu */}
                {appSelectOpen && (
                  <div className="absolute left-0 top-full mt-1.5 z-50 w-60 rounded-xl border border-border bg-popover p-1 shadow-lg animate-in fade-in zoom-in-95">
                    <div className="px-2 py-1.5 text-[11px] font-semibold text-muted-foreground border-b border-border/50">
                      Switch Application
                    </div>
                    <div className="max-h-56 overflow-y-auto custom-scrollbar [scrollbar-width:thin] [scrollbar-color:var(--border)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full p-1 space-y-0.5">
                      {appList.length === 0 ? (
                        <div className="p-2 text-center text-xs text-muted-foreground">
                          No applications found
                        </div>
                      ) : (
                        appList.map((app) => {
                          const isCurrent = app.id === application.id;
                          return (
                            <button
                              key={app.id}
                              type="button"
                              onClick={() => handleSelectApp(app)}
                              disabled={isSwitching}
                              className={`flex w-full items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-xs text-left transition-colors cursor-pointer ${
                                isCurrent
                                  ? "bg-secondary2 text-foreground font-semibold"
                                  : "hover:bg-secondary2/60 text-foreground"
                              }`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <Layers className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                <div className="min-w-0">
                                  <div className="truncate font-medium">
                                    {app.name}
                                  </div>
                                  {app.description && (
                                    <div className="text-[10px] text-muted-foreground truncate">
                                      {app.description}
                                    </div>
                                  )}
                                </div>
                              </div>
                              {isCurrent && (
                                <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                              )}
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>

              <Link
                href="/"
                className="text-[11px] font-medium text-foreground hover:text-primary hover:underline whitespace-nowrap"
              >
                Open application panel
              </Link>
            </div>
          )}
        </div>

        {/* Top-Right: Theme Toggle, Notifications, User Avatar */}
        <div className="flex items-center gap-2 h-full">
          <div className="relative flex items-center gap-1.5 p-1">
            <ThemeToggle />
            <button
              type="button"
              className="p-1.5 rounded-lg text-foreground hover:bg-secondary2 active:scale-95 transition-all cursor-pointer"
              aria-label="Notifications"
            >
              <Bell size={18} />
            </button>
          </div>
          <div className="h-full my-2 w-px bg-border"></div>
          <div className="relative flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-1 py-1.5 pr-1.5 pl-2 rounded-2xl! border border-border shadow-2xs text-left transition-all bg-canvas hover:bg-secondary2 hover:border-border/80 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
              aria-label="User profile menu"
              aria-expanded={menuOpen}
            >
              {user?.logo_url ? (
                // biome-ignore lint/performance/noImgElement: external user avatar URL
                <img
                  src={user.logo_url}
                  alt={displayName}
                  className="h-9 w-9 rounded-full border border-border object-cover"
                />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-foreground text-sm font-semibold text-background shadow-xs select-none">
                  {firstLetter}
                </div>
              )}
              <ChevronDown
                className={`hidden rotate-0 h-4 w-5 text-foreground sm:block stroke-3 ${menuOpen && "rotate-180"} transition-all duration-300`}
              />
            </button>

            {/* Profile Dropdown Menu */}
            {menuOpen && (
              <>
                <button
                  type="button"
                  tabIndex={-1}
                  aria-label="Close menu"
                  className="fixed inset-0 z-40 cursor-default bg-transparent"
                  onClick={() => setMenuOpen(false)}
                />
                <section className="absolute right-0 top-12 z-50 w-56 rounded-xl border border-border bg-canvas p-2 shadow-lg animate-in fade-in zoom-in-95">
                  {/* User Info */}
                  <div className="border-b border-border px-3 py-2 bg-secondary2 -m-2 rounded-t-xl">
                    <p className="text-xs font-semibold text-foreground">
                      {displayName}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {displayEmail}
                    </p>
                  </div>

                  {/* Links for pages */}
                  <div className="py-1.5 mt-3 flex flex-col text-sm">
                    <Link
                      href="/applications"
                      onClick={() => setMenuOpen(false)}
                      className="flex gap-2 py-1.5 px-3 items-center text-foreground hover:bg-secondary hover:text-secondary2 rounded-lg transition-all duration-200"
                    >
                      <Layers size={14} />
                      <span>Applications</span>
                    </Link>
                    <Link
                      href="/my-account"
                      onClick={() => setMenuOpen(false)}
                      className="flex gap-2 py-1.5 px-3 items-center text-foreground hover:bg-secondary hover:text-secondary2 rounded-lg transition-all duration-200"
                    >
                      <User size={14} />
                      <span>My Account</span>
                    </Link>
                    <Link
                      href="/settings"
                      onClick={() => setMenuOpen(false)}
                      className="flex gap-2 py-1.5 px-3 items-center text-foreground hover:bg-secondary hover:text-secondary2 rounded-lg transition-all duration-200"
                    >
                      <Settings2 size={14} />
                      <span>Settings</span>
                    </Link>
                    <Link
                      href="/help"
                      onClick={() => setMenuOpen(false)}
                      className="flex gap-2 py-1.5 px-3 items-center text-foreground hover:bg-secondary hover:text-secondary2 rounded-lg transition-all duration-200"
                    >
                      <HelpCircle size={14} />
                      <span>Help & Support</span>
                    </Link>
                  </div>

                  <div className="py-1 mt-1 border-t border-border">
                    <div className="flex items-center gap-2 px-3 py-1.5 text-xs text-muted-foreground">
                      <ShieldCheck className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>Customer Workspace</span>
                    </div>
                  </div>

                  {/* Sign Out Button */}
                  <div className="border-t border-border pt-1">
                    <form action={logoutAction}>
                      <button
                        type="submit"
                        className="flex w-full items-center gap-2 rounded-lg! px-3 py-2 text-xs text-destructive transition-colors hover:bg-destructive/10 duration-200 cursor-pointer"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        <span>Sign out</span>
                      </button>
                    </form>
                  </div>
                </section>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
