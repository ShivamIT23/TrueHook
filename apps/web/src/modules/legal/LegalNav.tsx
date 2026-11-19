"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LEGAL_TABS = [
  { label: "Terms & Conditions", href: "/terms" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Refund Policy", href: "/refund" },
];

export function LegalNav() {
  const pathname = usePathname();

  return (
    <div className="flex border-b border-border/70 overflow-x-auto mb-10 pb-1">
      <nav className="flex space-x-2">
        {LEGAL_TABS.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`rounded-lg px-3.5 py-2 text-xs font-medium transition-colors whitespace-nowrap ${
                isActive
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "text-muted-foreground hover:bg-secondary2 hover:text-foreground"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
