"use client";

import {
  Bell,
  ChevronDown,
  ExternalLink,
  HelpCircle,
  Layers,
  LogOut,
  Menu,
  Settings2,
  ShieldCheck,
  User,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { logoutAction } from "@/actions/auth";
import type { AuthUser } from "@/lib/types";
import type { Application } from "@/modules/applications/types";
import { TrueHookLogo } from "@/modules/auth/TrueHookLogo";

interface DashboardHeaderProps {
  user: AuthUser | null;
  application?: Application | null;
  onToggleMobileSidebar?: () => void;
  showLogo?: boolean;
}

export function DashboardHeader({
  user,
  application,
  onToggleMobileSidebar,
  showLogo = true,
}: DashboardHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

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
              className="flex items-center justify-center p-1.5 rounded-lg text-foreground hover:bg-secondary md:hidden cursor-pointer"
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
              <div className="flex items-center gap-1.5 rounded-lg bg-secondary px-2.5 py-1 border border-border">
                <Layers className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-semibold text-foreground max-w-30 sm:max-w-40 truncate">
                  {application.name}
                </span>
              </div>
              <Link
                href="/?switch=true"
                className="text-[11px] font-medium text-primary hover:underline"
              >
                Switch
              </Link>
            </div>
          )}
        </div>

        {/* Top-Right: User Avatar with First Letter if no logo_url */}
        <div className="flex items-center gap-2 h-full">
          <div className="relative flex items-center p-1.5">
            <Bell
              size={18}
              className="cursor-pointer hover:scale-110 transition-all duration-200 text-foreground"
            />
          </div>
          <div className="h-full my-2 w-px bg-border"></div>
          <div className="relative flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-1 py-1.5 pr-1 pl-2 rounded-2xl shadow-xs text-left transition-colors bg-canvas/90 hover:bg-canvas focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground shadow-xs select-none">
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
                  <div className="border-b border-foreground px-3 py-2 bg-primary/90 -m-2 rounded-t-xl">
                    <p className="text-xs font-semibold text-primary-foreground">
                      {displayName}
                    </p>
                    <p className="text-[11px] text-primary-foreground/90 truncate">
                      {displayEmail}
                    </p>
                  </div>

                  {/* Links for pages */}
                  <div className="py-1.5 mt-3 flex flex-col text-sm">
                    <Link
                      href="#"
                      className="flex gap-2 py-1.5 px-3 items-center opacity-80 hover:bg-primary hover:text-primary-foreground rounded-lg transition-all duration-200"
                    >
                      <User size={14} />
                      <span>My Account</span>
                    </Link>
                    <Link
                      href="#"
                      className="flex gap-2 py-1.5 px-3 items-center opacity-80 hover:bg-primary hover:text-primary-foreground rounded-lg transition-all duration-200"
                    >
                      <Settings2 size={14} />
                      <span>Settings</span>
                    </Link>
                    <Link
                      href="#"
                      className="flex gap-2 py-1.5 px-3 items-center opacity-80 hover:bg-primary hover:text-primary-foreground rounded-lg transition-all duration-200"
                    >
                      <HelpCircle size={14} />
                      <span>Help & Support</span>
                      <ExternalLink
                        size={13}
                        className="stroke-[2.5px] ml-auto"
                      />
                    </Link>
                  </div>

                  <div className="py-1 mt-1 border-t border-border">
                    <div className="flex items-center gap-2 px-3 py-1.5 text-xs text-muted-foreground">
                      <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                      <span>Customer Workspace</span>
                    </div>
                  </div>

                  {/* Sign Out Button */}
                  <div className="border-t border-border pt-1">
                    <form action={logoutAction}>
                      <button
                        type="submit"
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-destructive transition-colors hover:bg-destructive/10 duration-200 cursor-pointer"
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
