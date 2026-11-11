"use client";

import { useState } from "react";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { Sidebar } from "@/components/layout/Sidebar";
import type { AuthUser } from "@/lib/types";
import type { Application } from "@/modules/applications/types";

export interface ProtectedLayoutShellProps {
  children: React.ReactNode;
  user: AuthUser | null;
  application: Application | null;
}

export function ProtectedLayoutShell({
  children,
  user,
  application,
}: ProtectedLayoutShellProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <button
          type="button"
          tabIndex={-1}
          aria-label="Close sidebar overlay"
          className="fixed inset-0 z-40 bg-foreground/60 backdrop-blur-xs md:hidden cursor-default border-0 p-0 m-0"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Collapsible / Drawer Sidebar */}
      <Sidebar
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
        isDesktopCollapsed={isDesktopCollapsed}
        setIsDesktopCollapsed={setIsDesktopCollapsed}
      />

      {/* Main Content Column */}
      <div className="flex flex-1 flex-col min-w-0">
        <DashboardHeader
          user={user}
          application={application}
          onToggleMobileSidebar={() => setIsMobileOpen(true)}
          showLogo={false}
        />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
