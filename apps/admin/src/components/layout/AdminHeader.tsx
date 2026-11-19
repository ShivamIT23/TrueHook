"use client";

import { Activity, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOutAction } from "@/actions/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { AdminUser } from "@/lib/types";

interface AdminHeaderProps {
  user: AdminUser | null;
}

export function AdminHeader({ user }: AdminHeaderProps) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand & Badge */}
        <div className="flex items-center gap-6">
          <Link href="/overview" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-mono font-bold text-sm">
              TH
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold tracking-tight text-foreground">
                TrueHook
              </span>
              <Badge
                variant="outline"
                className="border-primary/40 bg-primary/10 text-primary text-[10px] font-mono uppercase px-1.5 py-0.5 tracking-wider"
              >
                ADMIN
              </Badge>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/overview"
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                pathname === "/overview"
                  ? "bg-foreground/10 text-foreground"
                  : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
              }`}
            >
              <Activity className="h-3.5 w-3.5 text-primary" />
              <span>Fleet & Health</span>
            </Link>
          </nav>
        </div>

        {/* Operator Profile & Sign Out */}
        <div className="flex items-center gap-3">
          {user && (
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-medium text-foreground">
                {user.name || "Operator"}
              </span>
              <span className="text-[11px] font-mono text-muted-foreground">
                {user.email}
              </span>
            </div>
          )}

          <form action={signOutAction}>
            <Button
              type="submit"
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 border-border bg-background text-xs font-medium text-foreground hover:bg-foreground/5 cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5 text-primary" />
              <span className="hidden sm:inline">Sign out</span>
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
