"use client";

import {
  Activity,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Radio,
  Send,
  Webhook,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ElementType } from "react";

export interface NavLinkItem {
  title: string;
  path: string;
  icon: ElementType;
}

export interface SidebarProps {
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  isDesktopCollapsed: boolean;
  setIsDesktopCollapsed: (collapsed: boolean) => void;
  navLinks?: NavLinkItem[];
}

export const defaultNavLinks: NavLinkItem[] = [
  {
    title: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Event Types",
    path: "/event-type",
    icon: Radio,
  },
  {
    title: "Endpoints",
    path: "/endpoints",
    icon: Webhook,
  },
  {
    title: "Events",
    path: "/events",
    icon: Send,
  },
  {
    title: "Deliveries",
    path: "/deliveries",
    icon: Activity,
  },
];

export function Sidebar({
  isMobileOpen,
  setIsMobileOpen,
  isDesktopCollapsed,
  setIsDesktopCollapsed,
  navLinks = defaultNavLinks,
}: SidebarProps) {
  const pathname = usePathname();

  const handleNavClick = () => {
    if (isMobileOpen) {
      setIsMobileOpen(false);
    }
  };

  return (
    <aside
      className={`fixed overflow-y-auto sidebar-scrollbar inset-y-0 left-0 z-50 shrink-0 bg-foreground text-cream transition-all duration-300 ease-in-out md:static md:inset-auto md:translate-x-0 ${
        isMobileOpen ? "translate-x-0" : "-translate-x-full"
      } ${isDesktopCollapsed ? "md:w-16 w-60" : "w-60"}`}
    >
      <div className="min-h-full flex flex-col justify-between">
        <div>
          {/* Sidebar Header */}
          <div className="px-2 py-1 flex items-center justify-center h-16">
            {isDesktopCollapsed ? (
              <button
                type="button"
                onClick={() => setIsDesktopCollapsed(false)}
                className="hidden md:flex h-9 w-9 rounded-[5px] bg-primary text-primary-foreground font-bold items-center justify-center text-sm shadow hover:bg-primary/90 transition-colors cursor-pointer"
                title="Expand sidebar"
              >
                TH
              </button>
            ) : null}

            <div
              className={
                isDesktopCollapsed
                  ? "md:hidden flex items-center justify-between w-full px-2"
                  : "flex items-center justify-between w-full px-2"
              }
            >
              <Link href="/dashboard" className="flex items-center gap-2 group">
                <Image
                  src="/logo1.png"
                  alt="TrueHook Logo"
                  width={280}
                  height={100}
                  priority
                  className="h-9 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                />
              </Link>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className="hidden md:flex text-muted-foreground hover:text-cream p-1 rounded hover:bg-secondary/10 transition-colors cursor-pointer"
                  onClick={() => setIsDesktopCollapsed(true)}
                  title="Collapse sidebar"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  className="md:hidden text-muted-foreground hover:text-cream ml-2 p-1 rounded hover:bg-secondary/10 cursor-pointer"
                  onClick={() => setIsMobileOpen(false)}
                  title="Close sidebar"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar Navigation */}
          <nav
            className={`pt-4 space-y-1 border-t border-border/20 ${
              isDesktopCollapsed ? "md:px-2 px-2" : "px-2"
            }`}
          >
            {navLinks.map((link) => {
              const isActive =
                pathname === link.path ||
                (link.path !== "/dashboard" &&
                  pathname?.startsWith(`${link.path}/`));
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  href={link.path}
                  onClick={handleNavClick}
                  title={link.title}
                  className={`flex items-center rounded-[5px] text-sm font-medium transition-colors ${
                    isDesktopCollapsed
                      ? "md:justify-center md:h-10 md:w-10 md:mx-auto md:p-0 justify-between px-2 py-1.5"
                      : "justify-between px-2 py-1.5"
                  } ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-secondary/10 hover:text-cream"
                  }`}
                >
                  <div
                    className={`flex items-center ${
                      isDesktopCollapsed
                        ? "md:justify-center md:gap-0 gap-3"
                        : "gap-3"
                    }`}
                  >
                    <Icon
                      size={isDesktopCollapsed ? 20 : 18}
                      className="shrink-0"
                    />
                    <span
                      className={
                        isDesktopCollapsed ? "md:hidden truncate" : "truncate"
                      }
                    >
                      {link.title}
                    </span>
                  </div>
                  {isActive && (
                    <ChevronRight
                      size={14}
                      className={
                        isDesktopCollapsed ? "md:hidden shrink-0" : "shrink-0"
                      }
                    />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div
          className={`p-4 border-t border-border/20 text-xs text-muted-foreground text-center transition-opacity duration-200 ${
            isDesktopCollapsed ? "md:hidden" : ""
          }`}
        >
          &copy; {new Date().getFullYear()} TrueHook
        </div>
      </div>
    </aside>
  );
}
