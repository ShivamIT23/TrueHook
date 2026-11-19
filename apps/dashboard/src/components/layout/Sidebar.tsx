"use client";

import {
  Activity,
  ChevronLeft,
  ChevronRight,
  Layers,
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
    title: "Applications",
    path: "/applications",
    icon: Layers,
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
      className={`fixed overflow-y-auto sidebar-scrollbar inset-y-0 left-0 z-50 shrink-0 bg-[#F3EEE3] dark:bg-[#111111] text-[#111111] dark:text-[#F3EEE3] border-r border-[#111111]/15 dark:border-[#F3EEE3]/15 transition-all duration-300 ease-in-out md:static md:inset-auto md:translate-x-0 ${
        isMobileOpen ? "translate-x-0" : "-translate-x-full"
      } ${isDesktopCollapsed ? "md:w-16 w-60" : "w-60"}`}
    >
      <div className="min-h-full flex flex-col justify-between">
        <div>
          {/* Sidebar Header */}
          <div className="px-3 py-2 flex items-center justify-center h-16 border-b border-[#111111]/10 dark:border-[#F3EEE3]/15">
            {isDesktopCollapsed ? (
              <button
                type="button"
                onClick={() => setIsDesktopCollapsed(false)}
                className="hidden md:flex h-9 w-9 rounded-lg items-center justify-center shadow-xs cursor-pointer hover:bg-[#111111]/10 dark:hover:bg-[#F3EEE3]/10 transition-colors"
                title="Expand sidebar"
              >
                <Image
                  src="/small-logo-black.png"
                  alt="TrueHook Logo"
                  width={280}
                  height={100}
                  priority
                  className="h-8 w-auto object-contain transition-transform duration-300 group-hover:scale-105 dark:hidden"
                />
                <Image
                  src="/small-logo-white.png"
                  alt="TrueHook Logo"
                  width={280}
                  height={100}
                  priority
                  className="h-8 w-auto object-contain transition-transform duration-300 group-hover:scale-105 hidden dark:block"
                />
              </button>
            ) : null}

            <div
              className={
                isDesktopCollapsed
                  ? "md:hidden flex items-center justify-between w-full px-1"
                  : "flex items-center justify-between w-full px-1"
              }
            >
              <Link href="/dashboard" className="flex items-center gap-2 group">
                {/* Light mode: logo1.png */}
                <Image
                  src="/logo1.png"
                  alt="TrueHook Logo"
                  width={280}
                  height={100}
                  priority
                  className="h-8 w-auto object-contain transition-transform duration-300 group-hover:scale-105 dark:hidden"
                />
                {/* Dark mode: white mark + text */}
                <div className="hidden dark:flex items-center gap-2">
                  <Image
                    src="/small-logo-white.png"
                    alt="TrueHook Logo"
                    width={32}
                    height={32}
                    priority
                    className="h-7 w-7 object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                  <span className="text-base font-bold tracking-tight text-[#F3EEE3] font-sans">
                    TrueHook
                  </span>
                </div>
              </Link>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className="hidden md:flex text-[#111111]/60 hover:text-[#111111] dark:text-[#F3EEE3]/60 dark:hover:text-[#F3EEE3] p-1.5 rounded-lg hover:bg-[#111111]/10 dark:hover:bg-[#F3EEE3]/10 transition-colors cursor-pointer"
                  onClick={() => setIsDesktopCollapsed(true)}
                  title="Collapse sidebar"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  className="md:hidden text-[#111111]/60 hover:text-[#111111] dark:text-[#F3EEE3]/60 dark:hover:text-[#F3EEE3] ml-1 p-1.5 rounded-lg hover:bg-[#111111]/10 dark:hover:bg-[#F3EEE3]/10 cursor-pointer"
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
            className={`pt-4 space-y-1 ${
              isDesktopCollapsed ? "md:px-2 px-2" : "px-3"
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
                  className={`flex items-center rounded-lg text-sm font-medium transition-all duration-150 ${
                    isDesktopCollapsed
                      ? "md:justify-center md:h-10 md:w-10 md:mx-auto md:p-0 justify-between px-2 py-1.5"
                      : "justify-between px-3 py-2"
                  } ${
                    isActive
                      ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                      : "text-[#111111]/70 hover:bg-[#111111]/10 hover:text-[#111111] dark:text-[#F3EEE3]/70 dark:hover:bg-[#F3EEE3]/10 dark:hover:text-[#F3EEE3]"
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
          className={`p-4 border-t border-[#111111]/10 dark:border-[#F3EEE3]/15 text-xs text-[#111111]/50 dark:text-[#F3EEE3]/50 text-center transition-opacity duration-200 ${
            isDesktopCollapsed ? "md:hidden" : ""
          }`}
        >
          &copy; {new Date().getFullYear()} TrueHook
        </div>
      </div>
    </aside>
  );
}
